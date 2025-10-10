import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, create or update user in database
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                role: "user",
                password: null, // OAuth users don't have passwords
              }
            })
          }
        } catch (error) {
          console.error("Error creating user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role
        token.id = (user as any).id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/en/auth/signin",
    error: "/en/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  // Add explicit URL configuration
  url: process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`,
  // Add trustHost for development
  trustHost: true,
  // Add event logging for debugging
  events: {
    async signIn(message: any) {
      console.log("NextAuth signIn event:", message);
    },
    async signOut(message: any) {
      console.log("NextAuth signOut event:", message);
    },
    async session(message: any) {
      console.log("NextAuth session event:", message);
    },
  },
  // Add custom fetch configuration
  adapter: undefined, // Use JWT strategy
  secret: process.env.NEXTAUTH_SECRET,
  // Add custom fetch function to handle errors
  logger: {
    error(code, metadata) {
      console.error("NextAuth error:", code, metadata);
    },
    warn(code) {
      console.warn("NextAuth warning:", code);
    },
    debug(code, metadata) {
      console.log("NextAuth debug:", code, metadata);
    },
  },
};
