import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const data = await Leave.find({
            employeeId: session.user.id,
        }).sort({ createdAt: -1 });

        return Response.json(data);
    }catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 401 });
    }
    return Response.json({ error: "Something went wrong" }, { status: 401 });
  }
}