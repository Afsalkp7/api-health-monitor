import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { log } from "util";

/**
 * Helper function to refresh the access token via the backend.
 */
async function refreshAccessToken(token: any) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
    // Call your backend refresh endpoint
    const response = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.data.accessToken,
      accessTokenExpires: Date.now() + refreshedTokens.data.expiresIn * 1000, // Update expiry
      // Fall back to old refresh token if the backend doesn't send a new one
      refreshToken: refreshedTokens.data.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);

    return {
      ...token,
      error: "RefreshAccessTokenError", // This error string is passed to the client
    };
  }
}

export const authOptions: NextAuthOptions = {
  // 1. Configure the Provider
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        loginType: { label: "Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        try {
          let apiUrl = "/auth/login";
          let payload = {};

          if (credentials.loginType === "otp") {
            // BRANCH A: OTP Verification
            apiUrl = "/auth/verify-otp";
            payload = {
              email: credentials.email,
              otp: credentials.otp,
            };
          } else {
            // BRANCH B: Standard Password Login
            apiUrl = "/auth/login";
            payload = {
              email: credentials.email,
              password: credentials.password,
            };
          }

          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

          const res = await fetch(`${backendUrl}${apiUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const response = await res.json();

          if (!res.ok || !response.status) {
            throw new Error(response.message || "Authentication failed");
          }

          // --- RETURN OBJECT FOR JWT CALLBACK ---
          // We now include the refreshToken and expiry calculation
          return {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            // Calculate expiry time (e.g., Date.now() + 3600 * 1000)
            accessTokenExpires: Date.now() + response.data.expiresIn * 1000,
          } as any;
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
    async jwt({ token, user }) {
      // A) Initial Sign In
      if (user) {
        const u = user as any;
        return {
          ...token,
          id: u.id,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpires: u.accessTokenExpires,
        };
      }

      // B) Token is still valid (Return as is)
      // We subtract a small buffer (e.g., 10s) to be safe
      if (Date.now() < (token.accessTokenExpires as number) - 10000) {
        return token;
      }

      // C) Token Expired (Try to refresh)
      return refreshAccessToken(token);
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken; // Optional: Expose if needed client-side
        session.user.email = token.email || "";
        session.user.name = token.name || "";

        // Pass the error to the client so you can force logout if refresh failed
        session.error = token.error;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
