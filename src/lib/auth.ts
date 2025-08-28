import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createDefaultPet } from "./database";
import { sql } from "@vercel/postgres";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface User {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      try {
        // Create user in database if they don't exist
        await sql`
          INSERT INTO users (id, name, email, image)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${user.image})
          ON CONFLICT (id) DO NOTHING
        `;
        
        // Create default pet for new user
        if (isNewUser) {
          await createDefaultPet(user.id);
        }
      } catch (error) {
        console.error('Failed to create user/pet:', error);
      }
    },
  },
};
