import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const employees = await Employee.find()
      .select("-password")
      .populate("department");

    return Response.json(employees);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { name, email, password, role, baseSalary } = body;

    const existing = await Employee.findOne({ email });
    if (existing) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      name,
      email,
      password: hashed,
      role: role || "employee",
      baseSalary,
      joiningDate: new Date(),
    });

    return Response.json(employee);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}