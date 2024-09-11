import { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyApiKey, getApiKeyDescription } from "@/lib/apiKeyAuth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      apiKey?: string;
      name?: string;
    } & DefaultSession["user"];
  }
  interface User {
    apiKey?: string;
    name?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "API Key",
      credentials: {
        apiKey: { label: "API Key", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.apiKey) {
          const isValid = await verifyApiKey(credentials.apiKey);
          if (isValid) {
            const name = await getApiKeyDescription(credentials.apiKey);
            return {
              id: "1",
              apiKey: credentials.apiKey,
              name: name || "User",
            };
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
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.apiKey = token.apiKey as string;
      session.user.name = token.name as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
};
