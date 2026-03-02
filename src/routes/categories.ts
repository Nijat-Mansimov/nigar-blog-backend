import express, { Router } from "express";
import { authenticateAdmin, authorizeAdmin } from "../middleware/auth.js";
import { CategoryController } from "../controllers/categoryController.js";

export const categoriesRouter: Router = express.Router();

// Public category routes
categoriesRouter.get("/", CategoryController.getAll);

// Admin category routes
categoriesRouter.post("/", authenticateAdmin, authorizeAdmin, CategoryController.create);
categoriesRouter.put("/:id", authenticateAdmin, authorizeAdmin, CategoryController.update);
categoriesRouter.delete("/:id", authenticateAdmin, authorizeAdmin, CategoryController.delete);
