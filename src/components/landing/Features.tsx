import { TrendingUp, Mic2, Presentation, Video, CalendarDays, Rss } from "lucide-react";
import { Card } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: TrendingUp,
      title: "Content Score Prediction",
      description: "AI-powered engagement predictions (1-10 scale) help you prioritize the best posts before publishing.",
    },
    {
      icon: Mic2,
      title: "Brand Voice DNA",
      description: "Train the AI on your best posts. Generated content sounds like you, not generic AI.",
    },
    {
      icon: Presentation,
      title: "LinkedIn Carousel Outlines",
      description: "Get ready-to-design carousel slides with headlines and body text for each slide.",
    },
    {
      icon: Video,
      title: "YouTube Shorts Scripts",
      description: "Full scripts with [HOOK], [BODY], [CTA] sections and visual cue markers for production.",
    },
    {
      icon: CalendarDays,
      title: "One-Click Content Calendar",
      description: "Auto-schedule all 7 posts across the week using platform-specific best practices.",
    },
    {
      icon: Rss,
      title: "RSS Auto-Monitor",
      description: "Pro plan: ContentForge watches your blog RSS feed and auto-generates content for new posts.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">Features That Save Hours</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unique capabilities you won't find anywhere else
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="p-6 space-y-3 border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}