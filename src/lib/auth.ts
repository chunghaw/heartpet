import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";

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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if user exists
          const { rows } = await sql`
            SELECT * FROM users WHERE email = ${credentials.email}
          `;

          if (rows.length === 0) {
            // Create new user if they don't exist
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const { rows: newUser } = await sql`
              INSERT INTO users (id, email, name, password_hash)
              VALUES (${credentials.email}, ${credentials.email}, ${credentials.email.split('@')[0]}, ${hashedPassword})
              RETURNING *
            `;
            return {
              id: newUser[0].id,
              email: newUser[0].email,
              name: newUser[0].name,
            };
          }

          const user = rows[0];
          
          // Check password
          if (user.password_hash) {
            const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              };
            }
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
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
        
        // Don't create pet automatically - let user choose in onboarding
      } catch (error) {
        console.error('Failed to create user:', error);
      }
    },
  },
};
