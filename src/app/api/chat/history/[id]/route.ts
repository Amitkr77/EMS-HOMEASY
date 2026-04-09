import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" });
  }

  await connectDB();

  const messages = await Message.find({
    $or: [
      { senderId: session.user.id, receiverId: params.id },
      { senderId: params.id, receiverId: session.user.id },
    ],
  }).sort({ createdAt: 1 });

  return Response.json(messages);
}