import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for testing the waters",
      features: [
        "3 repurposes per month",
        "All 7 output formats",
        "Content scores on all outputs",
        "Copy to clipboard",
        "Basic calendar",
      ],
      cta: "Start Free",
      href: "/signup",
      popular: false,
    },
    {
      name: "Starter",
      price: "$15",
      period: "/month",
      description: "For consistent content creators",
      features: [
        "30 repurposes per month",
        "1 Brand Voice profile",
        "Content calendar with CSV export",
        "Content library with search",
        "Everything in Free",
      ],
      cta: "Start 7-Day Trial",
      href: "/signup?plan=starter",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For serious content marketers",
      features: [
        "Unlimited repurposes",
        "3 Brand Voice profiles",
        "RSS auto-monitoring",
        "Evergreen recycler",
        "Performance learning",
        "Priority AI speed",
        "Everything in Starter",
      ],
      cta: "Start 7-Day Trial",
      href: "/signup?plan=pro",
      popular: true,
    },
    {
      name: "Agency",
      price: "$79",
      period: "/month",
      description: "For teams managing multiple clients",
      features: [
        "Everything in Pro",
        "10 client workspaces",
        "5 team seats",
        "White-label exports",
        "Bulk generation (5 URLs at once)",
        "Client reporting",
      ],
      cta: "Contact Sales",
      href: "/signup?plan=agency",
      popular: false,
    },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 relative ${
                plan.popular ? "border-primary border-2 shadow-lg" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-heading font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-heading font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/pricing" className="text-primary hover:underline font-medium">
            See detailed comparison →
          </Link>
        </div>
      </div>
    </section>
  );
}