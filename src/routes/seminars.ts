import express, { Router } from "express";
import { SeminarController } from "../controllers/seminarController.js";

export const seminarsRouter: Router = express.Router();

// Public seminar routes
seminarsRouter.get("/", SeminarController.getAll);
seminarsRouter.get("/:slug", SeminarController.getBySlug);
seminarsRouter.post("/:slug/views", SeminarController.incrementViews);
seminarsRouter.get("/:slug/views", SeminarController.getViews);

export default seminarsRouter;
