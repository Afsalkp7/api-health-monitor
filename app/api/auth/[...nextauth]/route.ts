import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Importing from the file above

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };