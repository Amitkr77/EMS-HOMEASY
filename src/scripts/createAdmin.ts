import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Employee from "@/models/Employee";

const MONGO_URI = process.env.MONGO_URI!;

async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const existing = await Employee.findOne({ email: "admin@test.com" });

  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashed = await bcrypt.hash("123456", 10);

  await Employee.create({
    name: "Super Admin",
    email: "admin@test.com",
    password: hashed,
    role: "admin",
    baseSalary: 50000,
    joiningDate: new Date(),
  });

  console.log("Admin created successfully ✅");
  process.exit();
}

createAdmin();
