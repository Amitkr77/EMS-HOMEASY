import { connectDB } from "@/lib/db";
import Leave from "@/models/Leave";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "admin") {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const { status } = await req.json();

        const updated = await Leave.findByIdAndUpdate(
            params.id,
            {
                status,
                approvedBy: session.user.id,
            },
            { new: true }
        );

        return Response.json(updated);
    } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}