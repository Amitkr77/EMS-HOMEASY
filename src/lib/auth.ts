import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption"

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return session;
}