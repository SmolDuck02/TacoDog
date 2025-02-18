import type { User } from "@/lib/types";
import { avatars, banners } from "@/lib/utils";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const bcrypt = require("bcrypt");
const redis = Redis.fromEnv();
export const options: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  providers: [
    GoogleProvider({
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
        console.log("geyty", newUser);

        await redis.set(`user:${profile.sub}`, newUser);
        return newUser;
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { formData, mode } = credentials as { mode: string; formData: string };
        const { username, password } = JSON.parse(formData);

        try {
          if (mode === "update") {
            return JSON.parse(formData) as User;
          } else {
            let users = await redis.keys(`user:*`);

            if (users.length == 0) throw new Error("No users in the database");

            const values: User[] = await redis.mget(...users);
            const user = values.find((value) => {
              return value.username == username;
            });

            console.log("Found Username match", user?.username);

            if (!user) {
              throw new Error("User not found!");
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) throw new Error("Password Incorrect!");

            console.log("Logging in: Success Found user: ", user.username);

            return user as User;
          }
        } catch (error) {
          console.log(`${mode} catch error:`, error);
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
