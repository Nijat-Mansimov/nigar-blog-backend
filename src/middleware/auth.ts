import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your-refresh-key-change-in-production";

export interface AuthRequest extends Request {
  admin?: { username: string; role: string };
  userId?: string;
  body: any;
  params: any;
}

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    
    // Fetch the user from database to get the role
    const user = await User.findOne({ username: decoded.username });
    
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    
    req.admin = { username: decoded.username, role: user.role };
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
};

export const authorizeAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // First authenticate the user
    if (!req.admin || !req.admin.role) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Check if user has admin role
    if (req.admin.role !== "admin") {
      return res.status(403).json({ success: false, error: "Admin access required" });
    }

    next();
  } catch (error) {
    res.status(403).json({ success: false, error: "Authorization failed" });
  }
};

export const generateToken = (username: string): string => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
};

export const generateRefreshToken = (username: string): string => {
  return jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyRefreshToken = (token: string): { username: string } | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { username: string };
  } catch {
    return null;
  }
};
