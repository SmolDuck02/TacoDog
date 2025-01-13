import type { Error, User } from "@/lib/types";
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
        console.log(
          username,
          password,
          JSON.stringify(formData),
          credentials,
          JSON.stringify(credentials)
        );
        let user = await redis.get(`user:${username}`);
        console.log("user is you", user);
        try {
          if (mode === "Sign In") {
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
            const id = await redis.incr("user:id");
            const hashedPassword = await bcrypt.hash(password, 10);
            //redis.set dont return the record created, only an 'OK'
            await redis.set(`user:${username}`, {
              username,
              password: hashedPassword,
              id,
            });
          }

          user = await redis.get(`user:${username}`);
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
    async signIn({ user, credentials }) {
      const rawError = (user as Error).error || (user as Error).error?.errors; //returns a dict that has either error or errors

      if (rawError) {
        throw new Error(JSON.stringify(rawError));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.user = user as User;
      console.log(token, user);
      return token;
    },
    async session({ session, token }) {
      if (token) session.user = token.user as User;
      console.log(session, token);
      return session;
    },
  },
  pages: {
    signIn: "/register",
  },
  debug: true,
};
