"use client";

import { useRouter } from "nextjs-toploader/app";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  FileText,
  Users,
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -right-40 -top-40 h-80 w-80 rounded-full blur-3xl"></div>
        <div className="absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl"></div>
      </div>
      {/* Header */}
      <header className="bg-background/80 border-border/50 relative z-10 border-b backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/logo.svg"
                alt="lucide note Logo"
                width={24}
                height={24}
              />
            </div>
            <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              lucide note
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Badge variant="secondary" className="hidden sm:flex">
              <Sparkles className="mr-1 h-3 w-3" />
              Free Trial
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="md:size-default hover:bg-primary/10 transition-colors"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="md:size-default from-primary hover:from-primary/90 bg-gradient-to-r to-blue-600 shadow-lg transition-all duration-300 hover:to-blue-600/90 hover:shadow-xl"
              onClick={() => router.push("/auth/register")}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container relative z-10 mx-auto px-4 py-12 md:py-20">
        <div className="mb-16 text-center">
          <div className="animate-fade-down mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mb-4 transition-colors">
              <Zap className="mr-1 h-3 w-3 animate-pulse" />
              New: Real-time collaboration features
            </Badge>
          </div>

          <h1 className="animate-fade-up mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Organize Your Thoughts,
            <br />
            <span className="from-primary bg-gradient-to-r via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Collaborate Seamlessly
            </span>
          </h1>

          <p
            className="text-muted-foreground animate-fade-up mx-auto mb-8 max-w-3xl px-4 text-lg leading-relaxed md:text-xl lg:text-2xl"
            style={{ animationDelay: "0.1s" }}
          >
            Transform your team's productivity with our powerful note-taking
            platform. Create, share, and organize ideas with rich formatting,
            real-time collaboration, and enterprise-grade security.
          </p>

          <div
            className="animate-fade-up flex flex-col justify-center gap-4 px-4 sm:flex-row"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              size="lg"
              className="from-primary hover:from-primary/90 group w-full bg-gradient-to-r to-blue-600 px-8 py-4 text-lg shadow-xl transition-all duration-300 hover:to-blue-600/90 hover:shadow-2xl sm:w-auto"
              onClick={() => router.push("/auth/register")}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="hover:bg-primary/5 group w-full border-2 px-8 py-4 text-lg transition-all duration-300 sm:w-auto"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </Button>
          </div>

          <div
            className="text-muted-foreground animate-fade-up mt-12 flex items-center justify-center gap-8 text-sm"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            <div className="animate-fade-up text-center">
              <div className="from-primary mb-2 bg-gradient-to-r to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                10K+
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                Active Users
              </div>
            </div>
            <div
              className="animate-fade-up text-center"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="from-primary mb-2 bg-gradient-to-r to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                500+
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                Teams
              </div>
            </div>
            <div
              className="animate-fade-up text-center"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="from-primary mb-2 bg-gradient-to-r to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                1M+
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                Notes Created
              </div>
            </div>
            <div
              className="animate-fade-up text-center"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="from-primary mb-2 bg-gradient-to-r to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                99.9%
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                Uptime
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <div className="animate-fade-up mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything you need to{" "}
              <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Powerful features designed to enhance your team's productivity and
              creativity.
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="animate-fade-up group">
              <Card className="from-card to-card/50 hover:shadow-primary/10 h-full border-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 group-hover:shadow-xl">
                <CardHeader className="flex-1 text-center md:text-left">
                  <div className="from-primary/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br to-blue-600/20 transition-transform duration-300 group-hover:scale-105 md:mx-0">
                    <FileText className="text-primary h-8 w-8 group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="mb-2 text-xl md:text-2xl">
                    Rich Text Editor
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Write with style using our powerful editor with support for
                    headings, lists, code blocks, tables, and embedded media.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div
              className="animate-fade-up group"
              style={{ animationDelay: "0.1s" }}
            >
              <Card className="from-card to-card/50 h-full border-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-green-500/10 group-hover:shadow-xl">
                <CardHeader className="flex-1 text-center md:text-left">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 transition-transform duration-300 group-hover:scale-105 md:mx-0">
                    <Users className="h-8 w-8 text-green-600 group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="mb-2 text-xl md:text-2xl">
                    Team Collaboration
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Invite team members to your organization and collaborate on
                    notes in real-time with comments, mentions, and version
                    history.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div
              className="animate-fade-up group md:col-span-2 lg:col-span-1"
              style={{ animationDelay: "0.2s" }}
            >
              <Card className="from-card to-card/50 h-full border-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-purple-500/10 group-hover:shadow-xl">
                <CardHeader className="flex-1 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 transition-transform duration-300 group-hover:scale-105">
                    <Shield className="h-8 w-8 text-purple-600 group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="mb-2 text-xl md:text-2xl">
                    Enterprise Security
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Your notes are encrypted end-to-end and stored securely.
                    Control access with granular permissions and audit logs.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <div className="animate-fade-up mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Loved by{" "}
              <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-transparent">
                teams worldwide
              </span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              See what our users have to say about transforming their workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="animate-fade-up">
              <Card className="from-card to-card/50 h-full border-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex-1 p-6">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 animate-pulse fill-yellow-400 text-yellow-400"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "lucide note has revolutionized how our team collaborates.
                    The real-time editing and rich formatting make it so easy to
                    create professional documentation."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="from-primary flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br to-blue-600 text-sm font-semibold text-white">
                      SJ
                    </div>
                    <div>
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="text-muted-foreground text-sm">
                        Product Manager, TechCorp
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
              <Card className="from-card to-card/50 h-full border-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex-1 p-6">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 animate-pulse fill-yellow-400 text-yellow-400"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "The security features give us peace of mind. Our sensitive
                    project notes are safe and we can control exactly who has
                    access to what."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-semibold text-white">
                      MR
                    </div>
                    <div>
                      <div className="font-semibold">Mike Rodriguez</div>
                      <div className="text-muted-foreground text-sm">
                        CTO, StartupXYZ
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Card className="from-card to-card/50 h-full border-0 bg-gradient-to-br backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex-1 p-6">
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 animate-pulse fill-yellow-400 text-yellow-400"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "Since switching to lucide note, our team's productivity has
                    increased by 40%. The intuitive interface makes it easy for
                    everyone to contribute."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-sm font-semibold text-white">
                      AL
                    </div>
                    <div>
                      <div className="font-semibold">Anna Liu</div>
                      <div className="text-muted-foreground text-sm">
                        Team Lead, DesignStudio
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="animate-fade-up mb-16">
          <Card className="from-primary text-primary-foreground relative overflow-hidden border-0 bg-gradient-to-r via-blue-600 to-purple-600 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
            <CardContent className="relative p-8 text-center md:p-12">
              <div>
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Ready to transform your team's productivity?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed opacity-90 md:text-xl">
                  Join thousands of teams already using lucide note to
                  streamline their workflow, boost creativity, and achieve more
                  together.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary group bg-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl"
                    onClick={() => router.push("/auth/register")}
                  >
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary group bg-white px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:bg-white/90 hover:shadow-xl"
                    onClick={() => router.push("/auth/login")}
                  >
                    Sign In to Account
                  </Button>
                </div>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm opacity-75">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background/80 border-border/50 relative z-10 mt-16 border-t backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/logo.svg"
                    alt="lucide note Logo"
                    width={32}
                    height={32}
                  />
                  <div className="bg-primary absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full"></div>
                </div>
                <span className="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-xl font-bold text-transparent">
                  lucide note
                </span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Transform your team's productivity with our powerful note-taking
                platform. Create, share, and organize ideas with rich formatting
                and real-time collaboration.
              </p>
              <div className="flex gap-4">
                <div className="bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors">
                  <Globe className="text-primary h-5 w-5" />
                </div>
                <div className="bg-primary/10 hover:bg-primary/20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors">
                  <Users className="text-primary h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-border/50 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
            <p className="text-muted-foreground text-sm">
              &copy; 2025 lucide note. All rights reserved.
            </p>
            <div className="text-muted-foreground flex gap-6 text-sm">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
