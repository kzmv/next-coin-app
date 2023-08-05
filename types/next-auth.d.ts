import NextAuth, { DefaultSession, User } from "next-auth"
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession{
    accessToken?: string;
    error?: string;

  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    accessTokenExpires?: number;
    accessToken?: string;
    error?: string;
    user?: User
  }
}