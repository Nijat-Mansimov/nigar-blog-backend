import { Request, Response } from "express";
import { getArticles, getArticleBySlug, addArticle, updateArticle, deleteArticle } from "../data.js";
import { AuthRequest } from "../middleware/auth.js";
import { Article } from "../models.js";

export class ArticleController {
  // Get all articles (public)
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const articles = await getArticles();
      res.json({
        success: true,
        data: articles,
        total: articles.length,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ success: false, error: "Failed to fetch articles" });
    }
  }

  // Get featured article (public)
  static async getFeatured(req: Request, res: Response): Promise<void> {
    try {
      const featured = await Article.findOne({ featured: true });

      if (!featured) {
        const firstArticle = await Article.findOne().sort({ createdAt: -1 });
        if (!firstArticle) {
          res.status(404).json({ success: false, error: "No featured article found" });
          return;
        }
        res.json({
          success: true,
          data: firstArticle,
        });
        return;
      }

      res.json({
        success: true,
        data: featured,
      });
    } catch (error) {
      console.error("Error fetching featured article:", error);
      res.status(500).json({ success: false, error: "Failed to fetch featured article" });
    }
  }

  // Get article by slug (public)
  static async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const article = await getArticleBySlug(slug);

      if (!article) {
        res.status(404).json({ success: false, error: "Article not found" });
        return;
      }

      res.json({
        success: true,
        data: article,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ success: false, error: "Failed to fetch article" });
    }
  }

  // Create article (admin only)
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug, translations, date, category, featured, readingTime, image, defaultLanguage } = req.body;

      if (!slug || !translations) {
        res.status(400).json({ success: false, error: "Slug and translations are required" });
        return;
      }

      // Validate translations - at least one language must be complete, and any started language must be complete
      const availableLanguages = ["en", "az", "ru", "tr"];
      let hasValidLanguage = false;

      for (const lang of availableLanguages) {
        const langTranslation = translations[lang];
        const hasTitle = langTranslation?.title?.trim();
        const hasBody = langTranslation?.body?.trim();

        // If language has started but is incomplete, error
        if ((hasTitle && !hasBody) || (!hasTitle && hasBody)) {
          res.status(400).json({
            success: false,
            error: `Translation for ${lang.toUpperCase()}: Both title and body are required if you start translating in this language`,
          });
          return;
        }

        // Track if we have at least one complete language
        if (hasTitle && hasBody) {
          hasValidLanguage = true;
        }
      }

      // Ensure at least one language is complete
      if (!hasValidLanguage) {
        res.status(400).json({
          success: false,
          error: "At least one complete translation (title + body) is required",
        });
        return;
      }

      // Check if slug already exists
      const existingArticle = await Article.findOne({ slug });
      if (existingArticle) {
        res.status(409).json({ success: false, error: "Article with this slug already exists" });
        return;
      }

      const articleData = {
        slug,
        translations,
        date: date || new Date().toLocaleDateString(),
        category: category || "Essay",
        featured: featured || false,
        readingTime: readingTime || 5,
        defaultLanguage: defaultLanguage || "az",
        ...(image && { image }),
      };

      const newArticle = await Article.create(articleData);

      res.status(201).json({
        success: true,
        data: newArticle,
        message: "Article created successfully",
      });
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ success: false, error: "Failed to create article" });
    }
  }

  // Update article (admin only)
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { translations, date, category, featured, readingTime, image, defaultLanguage } = req.body;

      const article = await Article.findById(id);
      if (!article) {
        res.status(404).json({ success: false, error: "Article not found" });
        return;
      }

      // Update translations if provided
      if (translations) {
        // Validate translations - at least one language must be complete, and any started language must be complete
        const availableLanguages = ["en", "az", "ru", "tr"];
        let hasValidLanguage = false;

        for (const lang of availableLanguages) {
          const langTranslation = translations[lang];
          const hasTitle = langTranslation?.title?.trim();
          const hasBody = langTranslation?.body?.trim();

          // If language has started but is incomplete, error
          if ((hasTitle && !hasBody) || (!hasTitle && hasBody)) {
            res.status(400).json({
              success: false,
              error: `Translation for ${lang.toUpperCase()}: Both title and body are required if you start translating in this language`,
            });
            return;
          }

          // Track if we have at least one complete language
          if (hasTitle && hasBody) {
            hasValidLanguage = true;
          }
        }

        // Ensure at least one language is complete
        if (!hasValidLanguage) {
          res.status(400).json({
            success: false,
            error: "At least one complete translation (title + body) is required",
          });
          return;
        }

        article.translations = translations;
      }

      // Update other fields
      if (date) article.date = date;
      if (category) article.category = category;
      if (featured !== undefined) article.featured = featured;
      if (readingTime) article.readingTime = readingTime;
      if (defaultLanguage) article.defaultLanguage = defaultLanguage;
      if (image !== undefined) article.image = image;

      await article.save();

      res.json({
        success: true,
        data: article,
        message: "Article updated successfully",
      });
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ success: false, error: "Failed to update article" });
    }
  }

  // Delete article (admin only)
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await deleteArticle(id);

      if (!deleted) {
        res.status(404).json({ success: false, error: "Article not found" });
        return;
      }

      res.json({
        success: true,
        message: "Article deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ success: false, error: "Failed to delete article" });
    }
  }

  // Get single article by ID for admin editing
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);

      if (!article) {
        res.status(404).json({ success: false, error: "Article not found" });
        return;
      }

      // Map _id to id for consistent frontend usage
      const articleData = {
        ...article.toObject(),
        id: article._id,
      };

      res.json({
        success: true,
        data: articleData,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ success: false, error: "Failed to fetch article" });
    }
  }

  // Get all articles for admin dashboard
  static async getAdminList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articles = await getArticles();
      // Map _id to id for consistent frontend usage
      const mappedArticles = articles.map((article: any) => ({
        ...article.toObject(),
        id: article._id,
      }));
      res.json({
        success: true,
        data: mappedArticles,
        total: articles.length,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ success: false, error: "Failed to fetch articles" });
    }
  }

  // Increment view count
  static async incrementViews(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const article = await Article.findOne({ slug });

      if (!article) {
        res.status(404).json({ success: false, error: "Article not found" });
        return;
      }

      article.views = (article.views || 0) + 1;
      await article.save();

      res.json({
        success: true,
        data: {
          slug,
          views: article.views,
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
      const article = await Article.findOne({ slug });

      if (!article) {
        res.status(404).json({ success: false, error: "Article not found" });
        return;
      }

      res.json({
        success: true,
        data: {
          slug,
          views: article.views || 0,
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
      const imageName = `image-${timestamp}.jpg`;

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
