import { FileText, Sparkles, Calendar } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Paste Your Blog URL",
      description: "Drop in your blog post URL or paste your content directly. ContentForge handles the rest.",
    },
    {
      icon: Sparkles,
      title: "AI Generates 7 Posts",
      description: "Get platform-optimized content for Twitter, LinkedIn, Instagram, Facebook, Newsletter, YouTube, and LinkedIn Carousel — all in your voice.",
    },
    {
      icon: Calendar,
      title: "Plan Your Week",
      description: "One-click content calendar auto-schedules posts across the week using platform best practices.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From blog post to full content calendar in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 -z-10 text-8xl font-heading font-bold text-muted/20">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-heading font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}