import type { User } from "@/lib/types";
import { avatars, banners } from "@/lib/utils";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
const bcrypt = require("bcrypt");
const redis = Redis.fromEnv();
export const options: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redis),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { formData, mode } = credentials as { mode: string; formData: string };
        const { username, password } = JSON.parse(formData);

        let user = await redis.get(`user:${username}`);
        console.log(user, formData);
        try {
          if (mode === "update") {
            return JSON.parse(formData) as User;
          } else if (mode === "Sign In") {
            if (!user) {
              throw new Error("User not found!");
            }

            const passwordMatch = await bcrypt.compare(password, (user as User).password);
            if (!passwordMatch) {
              throw new Error("Incorrect password!");
            }
          }
          //user registration
          else {
            if (user) {
              throw new Error("User already exists!");
            }

            const id = await redis.incr("userCounter:id");
            const hashedPassword = await bcrypt.hash(password, 10);

            //redis.set dont return the record created, only an 'OK'
            await redis.set(`user:${username}`, {
              username,
              password: hashedPassword,
              id,
              avatar: avatars[id % avatars.length],
              banner: banners[id % banners.length],
            });
          }

          user = await redis.get(`user:${username}`);
          console.log(`Auth fetched user: ${user}`);
          return user as User;
        } catch (error) {
          console.error(`${mode} catch error:`, error);
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
