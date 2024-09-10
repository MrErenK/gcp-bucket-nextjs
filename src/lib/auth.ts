import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyApiKey } from "@/lib/apiKeyAuth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      apiKey?: string;
    } & DefaultSession["user"];
  }
  interface User {
    apiKey?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "API Key",
      credentials: {
        apiKey: { label: "API Key", type: "password" },
      },
      async authorize(credentials) {
        if (credentials?.apiKey) {
          const isValid = await verifyApiKey(credentials.apiKey);
          if (isValid) {
            return { id: "1", apiKey: credentials.apiKey };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.apiKey = user.apiKey;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.apiKey = token.apiKey as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
