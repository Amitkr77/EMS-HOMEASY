import { connectDB } from "@/lib/db";
import Notice from "@/models/Notice";

export async function GET() {
    await connectDB();

    const notices = await Notice.find().sort({ createdAt: -1 });

    return Response.json(notices);
}