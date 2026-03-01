import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, seedDatabase } from "./db.js";
import { articlesRouter } from "./routes/articles.js";
import { adminRouter } from "./routes/admin.js";
import { categoriesRouter } from "./routes/categories.js";
import { settingsRouter } from "./routes/settings.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// Connect to MongoDB and seed database
(async () => {
  try {
    await connectDB();
    await seedDatabase();
  } catch (err) {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  }
})();

// Middleware
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/articles", articlesRouter);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/settings", settingsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📝 API documentation available at http://localhost:${port}/api/articles`);
});
