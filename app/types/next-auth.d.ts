import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      accessToken: string;
      refreshToken?: string;
      accessTokenExpires?: number;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
  }
}