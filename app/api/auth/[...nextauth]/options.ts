import type { User } from "@/lib/types";
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

            // const passwordMatch = await bcrypt.compare(password, (user as User).password);
            // if (!passwordMatch) {
            //   throw new Error("Incorrect password!");
            // }
          }
          //user registration
          // else {
          //   if (user) {
          //     throw new Error("User already exists!");
          //   }

          //   const hashedPassword = await bcrypt.hash(password, 10);

          //   //redis.set dont return the record created, only an 'OK'
          //   await redis.set(`user:${id}`, {
          //     id,
          //     username,
          //     password: hashedPassword,
          //     avatar: avatars[id % avatars.length],
          //     banner: banners[id % banners.length],
          //   });
          // }

          // user = await redis.get(`user:${id}`);
          // console.log(`Auth fetched user: ${user}`);
          // return user as User;
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
