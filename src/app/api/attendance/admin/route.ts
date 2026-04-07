import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    // ✅ Properly typed filter
    const filter: { date?: string } = {};

    if (date) {
      filter.date = date;
    }

    const data = await Attendance.find(filter)
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    return Response.json(data);
  } catch (err: unknown) {
    // ✅ Safe error handling
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}