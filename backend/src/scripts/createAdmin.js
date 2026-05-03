/**
 * Run this script to create an admin user directly in the database.
 * Usage: node src/scripts/createAdmin.js
 */

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const ADMIN = {
  name: "Admin",
  email: "admin@serviceapp.com",
  password: "admin123",
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const exists = await User.findOne({ email: ADMIN.email });
    if (exists) {
      // If user exists but is not admin, upgrade them
      if (exists.role !== "admin") {
        await User.findByIdAndUpdate(exists._id, { role: "admin" });
        console.log(`✅ Existing user upgraded to admin: ${ADMIN.email}`);
      } else {
        console.log(`ℹ️  Admin already exists: ${ADMIN.email}`);
      }
    } else {
      const hashed = await bcrypt.hash(ADMIN.password, 10);
      await User.create({ ...ADMIN, password: hashed, role: "admin" });
      console.log(`✅ Admin user created!`);
    }

    console.log("─────────────────────────────");
    console.log(`📧 Email   : ${ADMIN.email}`);
    console.log(`🔑 Password: ${ADMIN.password}`);
    console.log("─────────────────────────────");
    console.log("⚠️  Change the password after first login!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seed();
