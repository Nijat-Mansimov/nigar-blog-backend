import express, { Router } from "express";
import { authenticateAdmin } from "../middleware/auth.js";
import { AuthController } from "../controllers/authController.js";
import { ArticleController } from "../controllers/articleController.js";

export const adminRouter: Router = express.Router();

// Authentication routes
adminRouter.post("/login", AuthController.login);
adminRouter.post("/refresh", AuthController.refresh);
adminRouter.post("/logout", AuthController.logout);
adminRouter.get("/verify", authenticateAdmin, AuthController.verify);
adminRouter.post("/change-password", authenticateAdmin, AuthController.changePassword);

// Article management routes (admin only)
adminRouter.get("/articles", authenticateAdmin, ArticleController.getAdminList);
adminRouter.get("/articles/:id", authenticateAdmin, ArticleController.getById);
adminRouter.post("/articles", authenticateAdmin, ArticleController.create);
adminRouter.put("/articles/:id", authenticateAdmin, ArticleController.update);
adminRouter.delete("/articles/:id", authenticateAdmin, ArticleController.delete);

// Image upload (admin only)
adminRouter.post("/upload", authenticateAdmin, ArticleController.uploadImage);

