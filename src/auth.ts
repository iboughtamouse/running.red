import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const result = await db.query(
          "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
          [email]
        );

        const user = result.rows[0];
        if (!user) return null;

        const valid = await compare(password, user.password_hash as string);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: "Admin",
          email: user.email as string,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
});
