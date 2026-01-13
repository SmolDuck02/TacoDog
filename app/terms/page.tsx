import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service - TacoDog",
  description: "Read TacoDog's terms of service to understand the rules and guidelines for using our messaging platform.",
  openGraph: {
    title: "Terms of Service - TacoDog",
    description: "Read TacoDog's terms of service.",
    type: "website",
    url: "https://tacodog.onrender.com/terms",
  },
};

export default function Terms() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#ebe8e4] dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Agreement to Terms</h2>
            <p className="text-lg leading-relaxed text-foreground">
              By accessing or using TacoDog, you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the service.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Use of Service</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Eligibility</h3>
                <p className="text-muted-foreground">
                  You must be at least 13 years old to use TacoDog. By using the service, 
                  you represent that you meet this age requirement.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Account Responsibility</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account 
                  credentials and for all activities that occur under your account.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Acceptable Use</h3>
                <p className="text-muted-foreground mb-3">
                  You agree not to:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li>• Use the service for any illegal or unauthorized purpose</li>
                  <li>• Harass, abuse, or harm other users</li>
                  <li>• Share inappropriate, offensive, or harmful content</li>
                  <li>• Attempt to gain unauthorized access to the service</li>
                  <li>• Interfere with or disrupt the service or servers</li>
                  <li>• Use automated systems to access the service</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Content and Intellectual Property</h2>
            <p className="text-lg leading-relaxed text-foreground">
              You retain ownership of any content you create or share through TacoDog. 
              However, by using the service, you grant us a license to use, store, and 
              transmit your content as necessary to provide the service.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">AI Assistant Usage</h2>
            <p className="text-lg leading-relaxed text-foreground">
              TacoDog&apos;s AI assistant is powered by Google&apos;s Gemini AI. While we 
              strive for accuracy, the AI may occasionally provide incorrect or inappropriate 
              responses. Use the AI assistant at your own discretion and verify important 
              information independently.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Service Availability</h2>
            <p className="text-lg leading-relaxed text-foreground">
              We strive to provide reliable service but do not guarantee uninterrupted or 
              error-free operation. The service may be temporarily unavailable due to 
              maintenance, updates, or unforeseen circumstances.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Termination</h2>
            <p className="text-lg leading-relaxed text-foreground">
              We reserve the right to suspend or terminate your account at any time for 
              violation of these terms or for any other reason we deem necessary to 
              protect the service and its users.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Limitation of Liability</h2>
            <p className="text-lg leading-relaxed text-foreground">
              TacoDog is provided &quot;as is&quot; without warranties of any kind. We are not 
              liable for any damages arising from your use of the service, including but not 
              limited to data loss, service interruptions, or security breaches.
            </p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-lg opacity-90">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-semibold mb-4 text-foreground">Changes to Terms</h2>
            <p className="text-lg leading-relaxed text-foreground">
              We reserve the right to modify these terms at any time. Continued use of the 
              service after changes constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center pt-8">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
