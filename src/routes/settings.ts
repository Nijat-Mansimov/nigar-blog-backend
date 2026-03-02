import express from "express";
import { SettingsController } from "../controllers/settingsController.js";
import { authenticateAdmin, authorizeAdmin } from "../middleware/auth.js";

export const settingsRouter = express.Router();

// GET - public endpoint to fetch settings
settingsRouter.get("/", SettingsController.getSettings);

// PUT - admin-only endpoint to update settings
settingsRouter.put("/", authenticateAdmin, authorizeAdmin, SettingsController.updateSettings);
