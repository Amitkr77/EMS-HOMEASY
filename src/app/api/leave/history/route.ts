import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}