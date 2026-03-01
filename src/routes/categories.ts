import express, { Router } from "express";
import { authenticateAdmin } from "../middleware/auth.js";
import { CategoryController } from "../controllers/categoryController.js";

export const categoriesRouter: Router = express.Router();

// Public category routes
categoriesRouter.get("/", CategoryController.getAll);

// Admin category routes
categoriesRouter.post("/", authenticateAdmin, CategoryController.create);
categoriesRouter.put("/:id", authenticateAdmin, CategoryController.update);
categoriesRouter.delete("/:id", authenticateAdmin, CategoryController.delete);
