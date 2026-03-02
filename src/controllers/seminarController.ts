import { Request, Response } from "express";
import { Seminar } from "../models.js";
import { AuthRequest } from "../middleware/auth.js";

export class SeminarController {
  // Get all published seminars (public)
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const seminars = await Seminar.find({ published: true }).sort({ startDateTime: -1 });
      res.json({
        success: true,
        data: seminars,
        total: seminars.length,
      });
    } catch (error) {
      console.error("Error fetching seminars:", error);
      res.status(500).json({ success: false, error: "Failed to fetch seminars" });
    }
  }

  // Get seminar by slug (public)
  static async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const seminar = await Seminar.findOne({ slug, published: true });

      if (!seminar) {
        res.status(404).json({ success: false, error: "Seminar not found" });
        return;
      }

      res.json({
        success: true,
        data: seminar,
      });
    } catch (error) {
      console.error("Error fetching seminar:", error);
      res.status(500).json({ success: false, error: "Failed to fetch seminar" });
    }
  }

  // Create seminar (admin only)
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        slug,
        translations,
        topic,
        startDateTime,
        endDateTime,
        format,
        location,
        platformLink,
        registrationLink,
        coverImage,
        status,
        published,
        defaultLanguage,
      } = req.body;

      if (!slug || !translations || !topic || !startDateTime || !endDateTime || !format) {
        res.status(400).json({
          success: false,
          error: "slug, translations, topic, startDateTime, endDateTime, and format are required",
        });
        return;
      }

      // Validate translations
      const availableLanguages = ["en", "az", "ru", "tr"];
      let hasValidLanguage = false;

      for (const lang of availableLanguages) {
        const langTranslation = translations[lang];
        const hasTitle = langTranslation?.title?.trim();
        const hasDescription = langTranslation?.description?.trim();

        if ((hasTitle && !hasDescription) || (!hasTitle && hasDescription)) {
          res.status(400).json({
            success: false,
            error: `Translation for ${lang.toUpperCase()}: Both title and description are required if you start translating in this language`,
          });
          return;
        }

        if (hasTitle && hasDescription) {
          hasValidLanguage = true;
        }
      }

      if (!hasValidLanguage) {
        res.status(400).json({
          success: false,
          error: "At least one complete translation (title + description) is required",
        });
        return;
      }

      // Check if slug already exists
      const existingSeminar = await Seminar.findOne({ slug });
      if (existingSeminar) {
        res.status(409).json({ success: false, error: "Seminar with this slug already exists" });
        return;
      }

      // Validate format
      if (!["online", "offline", "hybrid"].includes(format)) {
        res.status(400).json({
          success: false,
          error: "Format must be 'online', 'offline', or 'hybrid'",
        });
        return;
      }

      // Validate required fields based on format
      if ((format === "offline" || format === "hybrid") && !location) {
        res.status(400).json({
          success: false,
          error: "Location is required for offline or hybrid seminars",
        });
        return;
      }

      if ((format === "online" || format === "hybrid") && !platformLink) {
        res.status(400).json({
          success: false,
          error: "Platform link is required for online or hybrid seminars",
        });
        return;
      }

      const seminarData = {
        slug,
        translations,
        topic,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        format,
        views: 0,
        status: status || "upcoming",
        published: published || false,
        defaultLanguage: defaultLanguage || "az",
        ...(location && { location }),
        ...(platformLink && { platformLink }),
        ...(registrationLink && { registrationLink }),
        ...(coverImage && { coverImage }),
      };

      const newSeminar = await Seminar.create(seminarData);

      res.status(201).json({
        success: true,
        data: newSeminar,
        message: "Seminar created successfully",
      });
    } catch (error) {
      console.error("Error creating seminar:", error);
      res.status(500).json({ success: false, error: "Failed to create seminar" });
    }
  }

  // Update seminar (admin only)
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        translations,
        topic,
        startDateTime,
        endDateTime,
        format,
        location,
        platformLink,
        registrationLink,
        coverImage,
        status,
        published,
        defaultLanguage,
      } = req.body;

      const seminar = await Seminar.findById(id);
      if (!seminar) {
        res.status(404).json({ success: false, error: "Seminar not found" });
        return;
      }

      // Update translations if provided
      if (translations) {
        const availableLanguages = ["en", "az", "ru", "tr"];
        let hasValidLanguage = false;

        for (const lang of availableLanguages) {
          const langTranslation = translations[lang];
          const hasTitle = langTranslation?.title?.trim();
          const hasDescription = langTranslation?.description?.trim();

          if ((hasTitle && !hasDescription) || (!hasTitle && hasDescription)) {
            res.status(400).json({
              success: false,
              error: `Translation for ${lang.toUpperCase()}: Both title and description are required if you start translating in this language`,
            });
            return;
          }

          if (hasTitle && hasDescription) {
            hasValidLanguage = true;
          }
        }

        if (!hasValidLanguage) {
          res.status(400).json({
            success: false,
            error: "At least one complete translation (title + description) is required",
          });
          return;
        }

        seminar.translations = translations;
      }

      // Validate format if provided
      if (format && !["online", "offline", "hybrid"].includes(format)) {
        res.status(400).json({
          success: false,
          error: "Format must be 'online', 'offline', or 'hybrid'",
        });
        return;
      }

      // Update other fields
      if (topic) seminar.topic = topic;
      if (startDateTime) seminar.startDateTime = new Date(startDateTime);
      if (endDateTime) seminar.endDateTime = new Date(endDateTime);
      if (format) seminar.format = format;
      if (location !== undefined) seminar.location = location || undefined;
      if (platformLink !== undefined) seminar.platformLink = platformLink || undefined;
      if (registrationLink !== undefined) seminar.registrationLink = registrationLink || undefined;
      if (coverImage !== undefined) seminar.coverImage = coverImage || undefined;
      if (status) seminar.status = status;
      if (published !== undefined) seminar.published = published;
      if (defaultLanguage) seminar.defaultLanguage = defaultLanguage;

      await seminar.save();

      res.json({
        success: true,
        data: seminar,
        message: "Seminar updated successfully",
      });
    } catch (error) {
      console.error("Error updating seminar:", error);
      res.status(500).json({ success: false, error: "Failed to update seminar" });
    }
  }

  // Delete seminar (admin only)
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const seminar = await Seminar.findByIdAndDelete(id);

      if (!seminar) {
        res.status(404).json({ success: false, error: "Seminar not found" });
        return;
      }

      res.json({
        success: true,
        message: "Seminar deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting seminar:", error);
      res.status(500).json({ success: false, error: "Failed to delete seminar" });
    }
  }

  // Get single seminar by ID for admin editing
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const seminar = await Seminar.findById(id);

      if (!seminar) {
        res.status(404).json({ success: false, error: "Seminar not found" });
        return;
      }

      const seminarData = {
        ...seminar.toObject(),
        id: seminar._id,
      };

      res.json({
        success: true,
        data: seminarData,
      });
    } catch (error) {
      console.error("Error fetching seminar:", error);
      res.status(500).json({ success: false, error: "Failed to fetch seminar" });
    }
  }

  // Get all seminars for admin dashboard (including unpublished)
  static async getAdminList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const seminars = await Seminar.find().sort({ startDateTime: -1 });
      const mappedSeminars = seminars.map((seminar: any) => ({
        ...seminar.toObject(),
        id: seminar._id,
      }));
      res.json({
        success: true,
        data: mappedSeminars,
        total: seminars.length,
      });
    } catch (error) {
      console.error("Error fetching seminars:", error);
      res.status(500).json({ success: false, error: "Failed to fetch seminars" });
    }
  }

  // Increment view count
  static async incrementViews(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const seminar = await Seminar.findOne({ slug });

      if (!seminar) {
        res.status(404).json({ success: false, error: "Seminar not found" });
        return;
      }

      seminar.views = (seminar.views || 0) + 1;
      await seminar.save();

      res.json({
        success: true,
        data: {
          slug,
          views: seminar.views,
        },
      });
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ success: false, error: "Failed to increment view count" });
    }
  }

  // Get view count
  static async getViews(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const seminar = await Seminar.findOne({ slug });

      if (!seminar) {
        res.status(404).json({ success: false, error: "Seminar not found" });
        return;
      }

      res.json({
        success: true,
        data: {
          slug,
          views: seminar.views || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching view count:", error);
      res.status(500).json({ success: false, error: "Failed to fetch view count" });
    }
  }

  // Upload image
  static async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { image } = req.body;

      if (!image) {
        res.status(400).json({ success: false, error: "Image data required" });
        return;
      }

      const timestamp = Date.now();
      const imageName = `seminar-image-${timestamp}.jpg`;

      res.json({
        success: true,
        data: {
          url: `data:image/jpeg;base64,${image.split(",")[1] || image}`,
          name: imageName,
        },
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ success: false, error: "Failed to upload image" });
    }
  }
}
