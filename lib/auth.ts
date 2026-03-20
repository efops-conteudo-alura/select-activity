import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        if (!user.password) {
          throw new Error("NeedPassword");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        const appRole = await prisma.appRole.findUnique({
          where: { userId_app: { userId: user.id, app: "select-activity" } },
        });

        if (!appRole) {
          throw new Error("NoAccess");
        }

        return { id: user.id, email: user.email, name: user.name, role: appRole.role };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }: { token: Record<string, unknown>; user?: { id: string; role: string } }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    session({ session, token }: { session: { user?: Record<string, unknown> }; token: Record<string, unknown> }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
