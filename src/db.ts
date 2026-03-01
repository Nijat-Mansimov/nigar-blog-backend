import mongoose from "mongoose";
import { Article, Category } from "./models.js";
import { sampleArticlesData } from "./data.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://nigarshah:User123@articleapp.dxmmudo.mongodb.net/?appName=articleapp";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ MongoDB connected successfully");
  } catch (error) {
    console.error("✗ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const seedDatabase = async () => {
  try {
    const existingArticles = await Article.countDocuments();
    if (existingArticles > 0) return;

    console.log("Seeding database with sample articles and categories...");

    // Create default categories
    const categories = [
      { name: "Essay", slug: "essay" },
      { name: "Personal", slug: "personal" },
      { name: "Culture", slug: "culture" },
      { name: "Other", slug: "other" },
    ];

    for (const category of categories) {
      await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        { upsert: true }
      );
    }

    // Create sample articles
    for (const article of sampleArticlesData) {
      const { id, ...articleData } = article;
      await Article.findOneAndUpdate(
        { slug: articleData.slug },
        articleData,
        { upsert: true }
      );
    }

    console.log("✓ Database seeded successfully");
  } catch (error) {
    console.error("✗ Error seeding database:", error);
  }
};

export default mongoose;

