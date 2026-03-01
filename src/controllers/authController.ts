import { Request, Response } from "express";
import { generateToken, generateRefreshToken, verifyRefreshToken, AuthRequest } from "../middleware/auth.js";
import { User } from "../models.js";

// Store refresh tokens in memory (in production, use a database)
const refreshTokens: Set<string> = new Set();

export class AuthController {
  // Login admin
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ success: false, error: "Username and password required" });
        return;
      }

      // Find user in database
      const user = await User.findOne({ username });
      if (!user) {
        console.log(`User not found: ${username}`);
        res.status(401).json({ success: false, error: "Invalid credentials" });
        return;
      }

      // Compare passwords
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        console.log(`Invalid password for user: ${username}`);
        res.status(401).json({ success: false, error: "Invalid credentials" });
        return;
      }

      console.log(`User ${username} logged in successfully`);
      const accessToken = generateToken(username);
      const refreshToken = generateRefreshToken(username);
      refreshTokens.add(refreshToken);

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          admin: { username },
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, error: "Login failed" });
    }
  }

  // Refresh access token
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ success: false, error: "Refresh token required" });
        return;
      }

      if (!refreshTokens.has(refreshToken)) {
        res.status(401).json({ success: false, error: "Invalid refresh token" });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) {
        refreshTokens.delete(refreshToken);
        res.status(401).json({ success: false, error: "Refresh token expired" });
        return;
      }

      const newAccessToken = generateToken(decoded.username);
      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ success: false, error: "Token refresh failed" });
    }
  }

  // Logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        refreshTokens.delete(refreshToken);
      }
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ success: false, error: "Logout failed" });
    }
  }

  // Verify token
  static async verify(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          admin: { username: req.admin?.username || "Unknown" },
        },
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ success: false, error: "Token verification failed" });
    }
  }

  // Change password
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const username = req.admin?.username;

      if (!username) {
        res.status(401).json({ success: false, error: "Not authenticated" });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, error: "Current and new password required" });
        return;
      }

      if (currentPassword === newPassword) {
        res.status(400).json({ success: false, error: "New password must be different from current password" });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ success: false, error: "Password must be at least 8 characters long" });
        return;
      }

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        res.status(404).json({ success: false, error: "User not found" });
        return;
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        res.status(401).json({ success: false, error: "Current password is incorrect" });
        return;
      }

      // Update password
      user.password = newPassword;
      await user.save();

      console.log(`Password changed for user: ${username}`);
      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ success: false, error: "Failed to change password" });
    }
  }
}

export function getRefreshTokens(): Set<string> {
  return refreshTokens;
}
