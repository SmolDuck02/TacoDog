import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter, Mulish } from "next/font/google";
import { Toaster } from "sonner";
import { options } from "./api/auth/[...nextauth]/options";
import "./globals.css";
import { UserContextProvider } from "@/lib/context/UserContext";

const inter = Inter({ subsets: ["latin"] });
const mulish = Mulish({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TacoDog",
  description: "Chat App integrated with AI",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(options);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <AuthProvider session={session}>
        <UserContextProvider>
          <body className={`${mulish.className} text-[var(--color)]`}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </body>
        </UserContextProvider>
      </AuthProvider>
    </html>
  );
}
