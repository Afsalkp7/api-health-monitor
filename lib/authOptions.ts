import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  // 1. Configure the Provider
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // Standard Fields
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // New Fields for OTP Logic
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        // We need at least an email to proceed
        if (!credentials?.email) return null;

        try {
          let apiUrl = "/auth/login";
          let payload = {};

          // --- LOGIC BRANCHING ---
          // Check if we are doing a normal login or an OTP verification
          if (credentials.loginType === "otp") {
             // BRANCH A: OTP Verification (Auto-Login)
             apiUrl = "/auth/verify-otp";
             payload = { 
                 email: credentials.email, 
                 otp: credentials.otp 
             };
          } else {
             // BRANCH B: Standard Password Login
             apiUrl = "/auth/login";
             payload = { 
                 email: credentials.email, 
                 password: credentials.password 
             };
          }

          // We use the direct Backend URL for server-side calls (More stable than proxy)
          // Make sure NEXT_PUBLIC_BACKEND_URL is set in your .env
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

          const res = await fetch(`${backendUrl}${apiUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const response = await res.json();

          // Check for errors
          if (!res.ok || !response.status) {
            throw new Error(response.message || "Authentication failed");
          }

          // Return the user object + Access Token
          // This object is passed to the 'jwt' callback below
          return {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            accessToken: response.data.accessToken,
          };
          
        } catch (error: any) {
            throw new Error(error.message);
        }
      },
    }),
  ],

  // 2. Configure Session Strategy
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },

  // 3. Callbacks
  callbacks: {
    // Step 1: Token Generation
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    // Step 2: Session Generation (What the client sees)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.email = token.email || "";
        session.user.name = token.name || "";
      }
      return session;
    },
  },

  // 4. Custom Pages
  // Ensure this matches your folder structure: src/app/(auth)/login
  pages: {
    signIn: "/login", 
  },

  secret: process.env.NEXTAUTH_SECRET,
};