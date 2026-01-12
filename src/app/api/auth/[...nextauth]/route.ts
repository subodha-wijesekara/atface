import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                await dbConnect();

                const user = await User.findOne({ username: credentials.username });
                if (!user) {
                    throw new Error("User not found");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user._id.toString(),
                    name: user.fullName || user.username,
                    username: user.username,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = (user as any).role;
                token.username = (user as any).username;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session?.user) {
                (session.user as any).role = token.role;
                (session.user as any).username = token.username;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev_only", // Should be in env
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
