import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOption";

const handler = NextAuth(authOptions);

// App Router only allows GET and POST exports
export { handler as GET, handler as POST };