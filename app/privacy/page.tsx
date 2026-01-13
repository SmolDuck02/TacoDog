import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy - TacoDog",
  description: "Read TacoDog's privacy policy to understand how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy - TacoDog",
    description: "Read TacoDog's privacy policy.",
    type: "website",
    url: "https://tacodog.onrender.com/privacy",
  },
};

export default function Privacy() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#ebe8e4] dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Introduction</h2>
            <p className="text-lg leading-relaxed text-foreground">
              At TacoDog, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our messaging application.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Account Information</h3>
                <p className="text-muted-foreground">
                  When you create an account, we collect your username, password (encrypted), and 
                  any profile information you choose to provide, such as avatars and banners.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Messages and Content</h3>
                <p className="text-muted-foreground">
                  We store your messages, shared files, and other content you create within the 
                  application to provide our messaging services.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Usage Data</h3>
                <p className="text-muted-foreground">
                  We may collect information about how you interact with our service, including 
                  connection times, features used, and device information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>To provide, maintain, and improve our messaging services</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>To authenticate your account and secure your data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>To enable real-time communication between users</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>To personalize your experience and provide AI assistant features</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>To respond to your inquiries and provide customer support</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Data Security</h2>
            <p className="text-lg leading-relaxed text-foreground">
              We implement appropriate technical and organizational security measures to protect 
              your personal information. However, no method of transmission over the internet 
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Your Rights</h2>
            <p className="text-lg leading-relaxed text-foreground mb-4">
              You have the right to:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Access and review your personal information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Request correction of inaccurate data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Request deletion of your account and data</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Opt-out of certain data collection practices</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Contact Us</h2>
            <p className="text-lg leading-relaxed text-foreground">
              If you have any questions about this Privacy Policy, please contact us through 
              the application or visit our support page.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center pt-8">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/terms">Terms of Service</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
