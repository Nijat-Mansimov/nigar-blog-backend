import { Request, Response } from "express";
import { Settings } from "../models.js";

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        // Return default settings if none exist
        return res.json({
          success: true,
          data: {
            about: {
              en: { title: "About Me", content: "Welcome to my blog." },
              az: { title: "Mənim Haqqımda", content: "Bloguma xoş gəlmişsiniz." },
              ru: { title: "Обо мне", content: "Добро пожаловать на мой блог." },
              tr: { title: "Hakkımda", content: "Bloguma hoş geldiniz." },
            },
          },
        });
      }
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ success: false, error: "Failed to fetch settings" });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const { about, aboutImage, socialMedia } = req.body;

      if (!about) {
        return res.status(400).json({ success: false, error: "About content is required" });
      }

      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings({ about, aboutImage, socialMedia });
      } else {
        settings.about = about;
        if (aboutImage !== undefined) {
          settings.aboutImage = aboutImage;
        }
        if (socialMedia !== undefined) {
          settings.socialMedia = socialMedia;
        }
      }

      await settings.save();
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ success: false, error: "Failed to update settings" });
    }
  }
}
