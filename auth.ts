import { PrismaAdapter } from "@auth/prisma-adapter";
import { compareSync } from "bcrypt-ts-edge";
import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";

export const config = {
  pages: {
    signIn: "/signin",
    error: "/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        //Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        //check if user exists & if password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          //If password correct return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        //if user does not exists or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      //set the userId from the token
      session.user.id = token.sub;
      //if there as an update, set the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
