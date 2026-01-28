import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Helper: Refresh Token
 */
async function refreshAccessToken(token: any) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
    
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
      // Backend now returns 'expiresIn' (900s). We calculate the new absolute time.
      accessTokenExpires: Date.now() + (refreshedTokens.data.expiresIn * 1000), 
      // Update Refresh Token if backend rotated it
      refreshToken: refreshedTokens.data.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
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
            apiUrl = "/auth/verify-otp";
            payload = { email: credentials.email, otp: credentials.otp };
          } else {
            apiUrl = "/auth/login";
            payload = { email: credentials.email, password: credentials.password };
          }

          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";
          const res = await fetch(`${backendUrl}${apiUrl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const response = await res.json();

          if (!res.ok || !response.status) {
            throw new Error(response.message || "Authentication failed");
          }

          // Return object for JWT Callback
          return {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            // Capture the 'expiresIn' (900s) from the initial login response
            accessTokenExpires: Date.now() + (response.data.expiresIn * 1000),
          } as any;
        } catch (error: any) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial Sign In
      if (user) {
        const u = user as any;
        return {
          ...token,
          id: u.id,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessTokenExpires: u.accessTokenExpires,
          name: u.name
        };
      }

      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }
      // Check if token is valid (with 10s buffer)
      if (Date.now() < (token.accessTokenExpires as number) - 10000) {
        return token;
      }

      // Token Expired -> Refresh
      return refreshAccessToken(token);
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.refreshToken = token.refreshToken;
        session.user.email = token.email || "";
        session.user.name = token.name || "";
        session.error = token.error;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};