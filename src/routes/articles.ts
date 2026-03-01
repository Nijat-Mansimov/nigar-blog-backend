import express, { Router } from "express";
import { ArticleController } from "../controllers/articleController.js";

export const articlesRouter: Router = express.Router();

// Public article routes
articlesRouter.get("/", ArticleController.getAll);
articlesRouter.get("/featured", ArticleController.getFeatured);
articlesRouter.get("/:slug", ArticleController.getBySlug);
articlesRouter.post("/:slug/views", ArticleController.incrementViews);
articlesRouter.get("/:slug/views", ArticleController.getViews);

