import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const today = new Date().toISOString().split("T")[0];

    const tasks = await Task.find({
      employeeId: session.user.id,
      date: today,
    }).sort({ createdAt: -1 });

    return Response.json(tasks);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
