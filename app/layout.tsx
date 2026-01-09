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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tacodog.onrender.com'),
  title: {
    default: "TacoDog - AI-Powered Social Messaging App",
    template: "%s | TacoDog"
  },
  description: "Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations in one beautiful platform.",
  keywords: [
    "chat app",
    "messaging app",
    "AI assistant",
    "real-time chat",
    "video calls",
    "social messaging",
    "TacoDog",
    "AI chat",
    "instant messaging",
    "web chat"
  ],
  authors: [{ name: "TacoDog Team" }],
  creator: "TacoDog",
  publisher: "TacoDog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tacodog.onrender.com",
    siteName: "TacoDog",
    title: "TacoDog - AI-Powered Social Messaging App",
    description: "Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations.",
    images: [
      {
        url: "https://tacodog.onrender.com/tacodog.png",
        width: 1200,
        height: 630,
        alt: "TacoDog - AI-Powered Social Messaging App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TacoDog - AI-Powered Social Messaging App",
    description: "Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations.",
    images: ["https://tacodog.onrender.com/tacodog.png"],
    creator: "@tacodog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "social",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(options);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tacodog.onrender.com';
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TacoDog",
    "description": "AI-powered social messaging app with real-time chat, video calls, and intelligent conversations",
    "url": baseUrl,
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "100"
    },
    "featureList": [
      "Real-time messaging",
      "Video calls",
      "AI assistant",
      "File sharing",
      "Group chats"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
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
