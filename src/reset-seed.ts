import mongoose from "mongoose";
import { User } from "./models.js";
import dotenv from "dotenv";

dotenv.config();

const resetAndSeedAdminUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://nigarshah:User123@articleapp.dxmmudo.mongodb.net/?appName=articleapp";
    console.log(`📌 Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Delete all existing users
    console.log("🗑️  Clearing existing users...");
    await User.deleteMany({});
    console.log("✅ Users collection cleared");

    // Create new admin user
    console.log("🔏 Creating new admin user...");
    const adminUser = new User({
      username: "nigarshah",
      password: "Password123!",
      email: "nigar@shah.com",
      role: "admin",
    });

    await adminUser.save();
    console.log("✅ Admin user 'nigarshah' created successfully");
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser._id}`);

    // Verify the user was actually saved
    const savedUser = await User.findOne({ username: "nigarshah" });
    if (savedUser) {
      console.log("✅ User verified in database");
      console.log(`   Found user with ID: ${savedUser._id}`);
    } else {
      console.log("❌ ERROR: User was not saved to database!");
    }

    await mongoose.disconnect();
    console.log("\n✨ Done! You can now login with:");
    console.log("   Username: nigarshah");
    console.log("   Password: Password123!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

resetAndSeedAdminUser();
