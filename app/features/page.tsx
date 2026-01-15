import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Bot, Video, Share2, ArrowRight } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Features - TacoDog",
  description: "Discover all the amazing features of TacoDog: AI-powered chat, real-time messaging, video calls, image sharing, and more.",
  openGraph: {
    title: "Features - TacoDog",
    description: "Discover all the amazing features of TacoDog.",
    type: "website",
    url: "https://tacodog.onrender.com/features",
  },
};

export default function Features() {
  const mainFeatures = [
    {
      Icon: MessageCircle,
      title: "Real-Time Messaging",
      description: "Send and receive messages instantly with friends. See when they're typing and when messages are delivered and read.",
    },
    {
      Icon: Bot,
      title: "AI Assistant",
      description: "Chat with TacoDog, your AI companion powered by Google's Gemini. Get help, answers, or just have a conversation anytime by typing '@t'.",
    },
    {
      Icon: Video,
      title: "Video & Voice Calls",
      description: "Make high-quality video calls with your friends. See and hear each other in real-time with crystal clear audio and video.",
    },
    {
      Icon: Share2,
      title: "Image Sharing",
      description: "Share photos, images easily. Select images to share with your contacts instantly.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#ebe8e4] dark:bg-slate-950">
      {/* Navigation Bar */}
      <nav className="w-full px-6 lg:px-12 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center overflow-hidden">
            <Image 
              src="/avatars/tacoAvatar.webp" 
              alt="TacoDog Logo" 
              width={32} 
              height={32}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <span className="text-xl font-bold text-foreground">TacoDog</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-foreground font-medium">
            Features
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/register">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Join Now</Link>
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">
              Features
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for the perfect messaging experience
            </p>
          </div>

          {/* 2x2 Grid of Features */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {mainFeatures.map((feature, index) => (
              <Card key={index} className="backdrop-blur-lg opacity-90 border-border">
                <CardContent className="p-8">
                  <div className="flex flex-col space-y-4">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                      <feature.Icon className="w-8 h-8 text-foreground" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join TacoDog today and experience the future of messaging
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/register">
                  Join Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 pt-8 border-t border-border">
        <nav className="flex flex-wrap gap-6 justify-center text-sm pb-8">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
        </nav>
      </footer>
    </main>
  );
}
