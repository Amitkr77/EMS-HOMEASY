import { connectDB } from "@/lib/db";
import Employee from "@/models/Employee";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    await connectDB();

    const employee = await Employee.findById(params.id)
      .select("-password")
      .populate("department");

    if (!employee) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(employee);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    return Response.json({ error: "Something went wrong" }, { status: 401 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updated = await Employee.findByIdAndUpdate(params.id, body, {
      new: true,
    }).select("-password");

    return Response.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdmin();
    await connectDB();

    // Soft delete
    await Employee.findByIdAndUpdate(params.id, {
      isActive: false,
    });

    return Response.json({ message: "Employee deactivated" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
