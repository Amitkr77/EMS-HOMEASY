import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();

  const existing = await Employee.findOne({ role: "admin" });

  if (existing) {
    return Response.json({ message: "Admin already exists" });
  }

  const hashed = await bcrypt.hash("123456", 10);

  await Employee.create({
    name: "Admin",
    email: "admin@test.com",
    password: hashed,
    role: "admin",
    baseSalary: 50000,
    joiningDate: new Date(),
  });

  return Response.json({ message: "Admin created ✅" });
}