import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

function calculateDays(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const body = await req.json();

        const days = calculateDays(body.startDate, body.endDate);

        const leave = await Leave.create({
            employeeId: session.user.id,
            leaveType: body.leaveType,
            startDate: body.startDate,
            endDate: body.endDate,
            daysRequested: days,
            reason: body.reason,
        });

        return Response.json(leave);
    } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    return Response.json({ error: "Something went wrong" }, { status: 401 });
  }
}