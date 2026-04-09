import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="container py-20 md:py-28 animate-fade-in">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          AI-Powered Content Repurposing
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold tracking-tight">
          Turn One Blog Post Into a Week of Content
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          7 platforms. 30 seconds. Your voice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-lg px-8">
              Start Free — No Credit Card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="font-medium text-lg px-8">
              See How It Works
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>7 Platforms</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Content Scores</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Brand Voice AI</span>
          </div>
        </div>
      </div>
    </section>
  );
}