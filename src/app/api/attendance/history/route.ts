import { connectDB } from "@/lib/db";
import Attendance from "@/models/Attendance";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  try {
    const session = await requireUser();
    await connectDB();

    const data = await Attendance.find({
      employeeId: session.user.id,
    }).sort({ date: -1 });

    return Response.json(data);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}