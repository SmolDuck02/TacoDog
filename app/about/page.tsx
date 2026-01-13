import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About TacoDog",
  description: "Learn about TacoDog - an AI-powered social messaging app that connects friends through real-time chat, video calls, and intelligent conversations.",
  openGraph: {
    title: "About TacoDog",
    description: "Learn about TacoDog - an AI-powered social messaging app.",
    type: "website",
    url: "https://tacodog.onrender.com/about",
  },
};

export default function About() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#ebe8e4] dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">About TacoDog</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Your AI-Powered Social Messaging Companion
          </p>
        </div>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Our Mission</h2>
            <p className="text-lg leading-relaxed text-foreground">
              TacoDog was created to revolutionize how people connect and communicate online. 
              We believe that messaging should be seamless, intelligent, and fun. That&apos;s why 
              we&apos;ve built an AI assistant right into your conversations, making every chat 
              experience more engaging and helpful.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">What Makes Us Different</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-foreground">Built-in AI Assistant</h3>
                  <p className="text-muted-foreground">
                    TacoDog isn&apos;t just a chatbot - it&apos;s your intelligent conversation 
                    partner powered by Google&apos;s Gemini AI. Ask questions, get help, or just chat!
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-foreground">Real-Time Everything</h3>
                  <p className="text-muted-foreground">
                    Experience instant messaging, live video calls, and real-time typing indicators. 
                    No delays, no waiting.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-foreground">Privacy First</h3>
                  <p className="text-muted-foreground">
                    Your conversations are yours. We prioritize your privacy and data security 
                    above all else.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-xl mb-2 text-foreground">Beautiful Design</h3>
                  <p className="text-muted-foreground">
                    Enjoy a modern, intuitive interface with dark mode support and customizable 
                    themes that make chatting a pleasure.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">How It Works</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
                <p className="text-lg text-foreground">Sign up or sign in to create your account</p>
              </div>
              <div className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
                <p className="text-lg text-foreground">Start chatting with friends or connect with TacoDog by typing &quot;@t&quot;</p>
              </div>
              <div className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
                <p className="text-lg text-foreground">Enjoy real-time messaging, video calls, and AI-powered conversations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center pt-8">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
