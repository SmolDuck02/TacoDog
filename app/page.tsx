import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to TacoDog - AI-powered social messaging app. Connect with friends, chat with your AI assistant, and enjoy real-time messaging and video calls.",
  openGraph: {
    title: "TacoDog - AI-Powered Social Messaging App",
    description: "Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations.",
    type: "website",
  },
};

export default function Home() {
  redirect("/chat");
}
