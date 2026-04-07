import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const data = await Leave.find()
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    return Response.json(data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}