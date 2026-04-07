import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOption";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}