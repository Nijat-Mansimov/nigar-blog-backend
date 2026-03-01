import { Request, Response } from "express";
import { getCategories, getCategoryBySlug, addCategory, updateCategory, deleteCategory } from "../data.js";
import { AuthRequest } from "../middleware/auth.js";

export class CategoryController {
  // Get all categories (public)
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const categories = await getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
  }

  // Get category by slug (public)
  static async getBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await getCategoryBySlug(slug);

      if (!category) {
        res.status(404).json({ success: false, error: "Category not found" });
        return;
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ success: false, error: "Failed to fetch category" });
    }
  }

  // Create category (admin only)
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, slug, description } = req.body;

      if (!name || !slug) {
        res.status(400).json({ success: false, error: "Name and slug are required" });
        return;
      }

      const existing = await getCategories();
      if (existing.some((c: any) => c.slug === slug)) {
        res.status(409).json({ success: false, error: "Category with this slug already exists" });
        return;
      }

      const newCategory = await addCategory({
        name,
        slug,
        description: description || "",
      });

      res.status(201).json({
        success: true,
        data: newCategory,
        message: "Category created successfully",
      });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ success: false, error: "Failed to create category" });
    }
  }

  // Update category (admin only)
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await updateCategory(id, updates);

      if (!updated) {
        res.status(404).json({ success: false, error: "Category not found" });
        return;
      }

      res.json({
        success: true,
        data: updated,
        message: "Category updated successfully",
      });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ success: false, error: "Failed to update category" });
    }
  }

  // Delete category (admin only)
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await deleteCategory(id);

      if (!deleted) {
        res.status(404).json({ success: false, error: "Category not found" });
        return;
      }

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ success: false, error: "Failed to delete category" });
    }
  }
}
