import mongoose from "mongoose";
import { User } from "./models.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdminUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://nigarshah:User123@articleapp.dxmmudo.mongodb.net/?appName=articleapp";
    console.log(`📌 Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if admin user already exists
    const existingUser = await User.findOne({ username: "nigarshah" });
    if (existingUser) {
      console.log("⚠️  Admin user 'nigarshah' already exists");
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Role: ${existingUser.role}`);
      await mongoose.disconnect();
      return;
    }

    // Create admin user with hashed password
    console.log("🔏 Creating new admin user...");
    const adminUser = new User({
      username: "nigarshah",
      password: "Password123!", // Will be hashed automatically by pre-save hook
      email: "nigar@shah.com",
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Admin user 'nigarshah' created successfully with hashed password");
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser._id}`);

    // Verify the user was actually saved
    const savedUser = await User.findOne({ username: "nigarshah" });
    if (savedUser) {
      console.log("✅ User verified in database");
    } else {
      console.log("❌ ERROR: User was not saved to database!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdminUser();
