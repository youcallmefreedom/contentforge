import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "How does ContentForge compare to other AI writing tools?",
      answer: "ContentForge is purpose-built for content repurposing across 7 platforms, not generic writing. Our Content Score predictions are unique — no competitor offers engagement forecasting. Plus, Brand Voice training ensures AI sounds like you, not generic AI.",
    },
    {
      question: "What's included in the free plan?",
      answer: "The free plan includes 3 repurposes per month with all 7 output formats (Twitter, LinkedIn, Instagram, Facebook, Newsletter, YouTube, LinkedIn Carousel), content scores, and basic calendar. No credit card required.",
    },
    {
      question: "Can I cancel or change my plan anytime?",
      answer: "Yes. All paid plans are month-to-month with no contracts. Upgrade, downgrade, or cancel anytime from your account settings. Refunds available within 7 days of subscription start.",
    },
    {
      question: "What platforms does ContentForge support?",
      answer: "All 7 major platforms: Twitter/X threads, LinkedIn posts, LinkedIn carousels (ready for Canva), Instagram captions with hashtags, Facebook posts, email newsletters, and YouTube Shorts scripts with timing cues.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption, never store your blog content permanently, and never train AI models on your data. Your Brand Voice profiles are private and only used for your generations. Full privacy policy available.",
    },
    {
      question: "How does Brand Voice training work?",
      answer: "Paste 3-10 of your best-performing posts into the voice trainer. Our AI analyzes tone, vocabulary, emoji usage, hashtag style, CTA patterns, and sentence structure to create a voice profile. Future generations use this profile to match your unique style.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about ContentForge
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6 bg-card">
                <AccordionTrigger className="text-left font-heading font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}