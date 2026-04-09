import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center space-y-8 p-12 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            Stop Spending Hours on Social Media
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free today. No credit card required. Cancel anytime.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-lg px-8">
              Start Free — No Credit Card
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}