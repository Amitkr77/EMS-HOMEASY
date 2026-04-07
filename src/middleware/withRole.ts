import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function GET(req: Request) {
  console.log(req.url);
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ message: "Protected data" });
}
