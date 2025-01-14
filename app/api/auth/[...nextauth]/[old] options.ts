import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


interface CredentialsData {
  formData: string;
  url: string;
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        try {
          const { formData, url } = credentials as CredentialsData;

          const response = await fetch(`http://127.0.0.1:8000/${url}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: formData,
          });

          const data = await response.json();
          if (data.error || data.errors) {
            console.error(`Signin error:`, data);
            return { error: data };
          } else {
            console.log(`Signin success:`, data);
            return data.user;
          }
        } catch (error) {
          console.error(`Signin catch error:`, error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // console.log("gg", user);
      const rawError = (user as Error).error || (user as Error).error?.errors; //returns a dict that has either error or errors

      if (rawError) {
        throw new Error(JSON.stringify(rawError));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user = token.user as User;
      return session;
    },
  },
  pages: {
    signIn: "/register",
  },
};

interface Error {
  error?: { error?: string; errors?: string };
}
