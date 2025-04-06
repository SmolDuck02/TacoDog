import type { User } from "@/lib/types";
import { avatars, banners } from "@/lib/utils";
import { Redis } from "@upstash/redis";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

type CredentialsData = { data: string };

const redis = Redis.fromEnv();

export const options: NextAuthOptions = {
  // adapter: UpstashRedisAdapter(redis),
  providers: [
    GoogleProvider({
      name: "google",
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",

      async profile(profile) {
        const existingUser = await redis.get(`user:${profile.sub}`);

        if (existingUser) {
          return existingUser;
        }

        const newUser = {
          id: profile.sub,
          username: profile.name,
          avatar: avatars[Math.floor(Math.random() * 10) % avatars.length],
          banner: banners[Math.floor(Math.random() * 10) % banners.length],
          ...profile,
        };

        await redis.del(`cachedUsers`);
        await redis.set(`user:${profile.sub}`, newUser);
        return newUser;
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { data } = credentials as CredentialsData;
        const { user, mode = "auth", allUsers = [] } = JSON.parse(data);
        const { username, password } = user;

        if (allUsers.length === 0) throw new Error("No users in the database");

        try {
          if (mode === "update") {
            return user as User;
          } else {
            const matchedUsernames = allUsers.filter((userItem: User) => {
              return userItem.username === username;
            });

            if (matchedUsernames.length === 0) {
              throw new Error("User not found!");
            }

            const matchedUsernamesID = matchedUsernames.map((userItem: User) => `user:${userItem.id}`);
            const matchedUsers = await redis.mget(...matchedUsernamesID) as User[];
            let foundUser: User | null = null;

            for (const userItem of matchedUsers) {
              if (await bcrypt.compare(password, userItem.password as string)) {
                foundUser = userItem;
                break;
              }
            }

            if (!foundUser) throw new Error("Password Incorrect!");

            return foundUser as User;
          }
        } catch (error) {
          throw error;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user as User;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user = token.user as User;
      return session;
    },
  },
  pages: {
    signIn: "/register",
    error: "/register",
  },
};
