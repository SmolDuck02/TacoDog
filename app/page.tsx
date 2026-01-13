import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Video, Users, Zap, Shield, Cloud } from "lucide-react";
import avatarOne from "@/public/avatars/avatarOne.png";
import avatarTwo from "@/public/avatars/avatarTwo.png";
import avatarThree from "@/public/avatars/avatarThree.png";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import tacoAvatar from "@/public/avatars/tacoAvatar.webp";

export const metadata: Metadata = {
  title: "TacoDog - AI-Powered Social Messaging App",
  description: "Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations in one beautiful platform.",
  openGraph: {
    title: "TacoDog - AI-Powered Social Messaging App",
    description: "Connect with friends and chat with TacoDog, your AI assistant. Real-time messaging, video calls, and intelligent conversations.",
    type: "website",
    url: "https://tacodog.onrender.com",
    images: ["https://tacodog.onrender.com/tacodog.png"],
  },
};

export default function Home() {
  const avatars = [
    { src: avatarOne, alt: "User 1" },
    { src: avatarTwo, alt: "User 2" },
    { src: avatarThree, alt: "User 3" },
    { src: defaultAvatar, alt: "User 4" },
    { src: tacoAvatar, alt: "TacoDog" },
  ];

  const icons = [
    { Icon: MessageCircle, label: "Messaging" },
    { Icon: Video, label: "Video Calls" },
    { Icon: Users, label: "Social" },
    { Icon: Zap, label: "Fast" },
    { Icon: Shield, label: "Secure" },
    { Icon: Cloud, label: "Cloud" },
  ];

  const features = [
    "Real-time messaging",
    "AI assistant powered by Gemini",
    "Video calls and voice chat",
    "Image sharing",
    "Dark mode support",
    "Fast and responsive",
  ];

  return (
    <div className="min-h-screen bg-[#ebe8e4] dark:bg-slate-950">
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
          <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
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

      {/* Main Content - Two Column Layout */}
      <main className="container mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Column - Headline and CTA */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Unlock Seamless
                <br />
                <span className="text-yellow-700">Messaging</span>
                <br />
                Experience 
                <br />
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Connect with friends and chat with TacoDog, your AI assistant. 
                Real-time messaging, video calls, and intelligent conversations in one beautiful platform.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/register">Join Now →</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {features.map((feature, index) => (
                <span key={index} className="px-3 py-1 rounded-full bg-card border border-border">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column - Circular Visual Section */}
          <div className="relative flex items-center justify-center min-h-[500px]">
            <div className="relative w-full max-w-md aspect-square">
              {/* Outer Circle */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 dark:border-primary/30"></div>
              
              {/* Middle Circle */}
              <div className="absolute inset-[25%] rounded-full border border-primary/30 dark:border-primary/40"></div>

              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl md:text-7xl font-bold text-foreground mb-2">20k+</div>
                  <div className="text-lg text-muted-foreground">Active Users</div>
                </div>
              </div>

              {/* Avatars positioned around circles */}
              {avatars.map((avatar, index) => {
                const angle = (index * 360) / avatars.length;
                const radius = 45; // percentage
                const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
                const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
                const avatarSrc = typeof avatar.src === 'string' ? avatar.src : avatar.src.src;
                
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Avatar className="w-12 h-12 md:w-16 md:h-16 border-2 border-primary/30 dark:border-primary/40 shadow-lg">
                      <AvatarImage src={avatarSrc} alt={avatar.alt} />
                      <AvatarFallback>{avatar.alt[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                );
              })}

              {/* Icons positioned on inner circle */}
              {icons.map((item, index) => {
                const angle = (index * 360) / icons.length;
                const radius = 30; // percentage for inner circle
                const x = 50 + radius * Math.cos((angle - 90) * (Math.PI / 180));
                const y = 50 + radius * Math.sin((angle - 90) * (Math.PI / 180));
                
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <Card className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-card/80 backdrop-blur-sm border-primary/30 dark:border-primary/40 shadow-lg">
                      <item.Icon className="w-6 h-6 text-foreground" />
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Partner/Feature Logos Section */}
        <div className="mt-20 pt-12 border-t border-border">
          <p className="text-center text-sm text-muted-foreground mb-8">Trusted by thousands of users</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            <div className="text-2xl font-bold text-foreground">TacoDog</div>
            <div className="text-lg text-muted-foreground">AI Chat</div>
            <div className="text-lg text-muted-foreground">Real-Time</div>
            <div className="text-lg text-muted-foreground">Secure</div>
            <div className="text-lg text-muted-foreground">Fast</div>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="mt-16 pt-8 border-t border-border">
          <nav className="flex flex-wrap gap-6 justify-center text-sm">
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
    </div>
  );
}
