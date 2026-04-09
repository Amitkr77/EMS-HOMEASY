import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" });
  }

  await connectDB();

  const { receiverId, message } = await req.json();

  const msg = await Message.create({
    senderId: session.user.id,
    receiverId,
    message,
  });

  return Response.json(msg);
}