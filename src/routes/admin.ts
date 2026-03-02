import express, { Router } from "express";
import { authenticateAdmin, authorizeAdmin } from "../middleware/auth.js";
import { AuthController } from "../controllers/authController.js";
import { ArticleController } from "../controllers/articleController.js";
import { SeminarController } from "../controllers/seminarController.js";

export const adminRouter: Router = express.Router();

// Authentication routes
adminRouter.post("/login", AuthController.login);
adminRouter.post("/refresh", AuthController.refresh);
adminRouter.post("/logout", AuthController.logout);
adminRouter.get("/verify", authenticateAdmin, authorizeAdmin, AuthController.verify);
adminRouter.post("/change-password", authenticateAdmin, authorizeAdmin, AuthController.changePassword);

// Article management routes (admin only)
adminRouter.get("/articles", authenticateAdmin, authorizeAdmin, ArticleController.getAdminList);
adminRouter.get("/articles/:id", authenticateAdmin, authorizeAdmin, ArticleController.getById);
adminRouter.post("/articles", authenticateAdmin, authorizeAdmin, ArticleController.create);
adminRouter.put("/articles/:id", authenticateAdmin, authorizeAdmin, ArticleController.update);
adminRouter.delete("/articles/:id", authenticateAdmin, authorizeAdmin, ArticleController.delete);

// Seminar management routes (admin only)
adminRouter.get("/seminars", authenticateAdmin, authorizeAdmin, SeminarController.getAdminList);
adminRouter.get("/seminars/:id", authenticateAdmin, authorizeAdmin, SeminarController.getById);
adminRouter.post("/seminars", authenticateAdmin, authorizeAdmin, SeminarController.create);
adminRouter.put("/seminars/:id", authenticateAdmin, authorizeAdmin, SeminarController.update);
adminRouter.delete("/seminars/:id", authenticateAdmin, authorizeAdmin, SeminarController.delete);

// Image upload (admin only)
adminRouter.post("/upload", authenticateAdmin, authorizeAdmin, ArticleController.uploadImage);

