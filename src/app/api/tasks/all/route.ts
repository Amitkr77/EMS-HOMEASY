import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
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

    let filter: any = {};

    if (date) {
      filter.date = date;
    }

    const tasks = await Task.find(filter)
      .populate("employeeId", "name email")
      .sort({ createdAt: -1 });

    return Response.json(tasks);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}