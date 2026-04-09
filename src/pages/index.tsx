import { SEO } from "@/components/SEO";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PlatformShowcase } from "@/components/landing/PlatformShowcase";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SEO
        title="ContentForge - Turn One Blog Post Into a Week of Content"
        description="AI-powered content repurposing tool. Generate platform-optimized social media posts for Twitter, LinkedIn, Instagram, Facebook, Newsletter, and YouTube from a single blog post."
        image="/og-image.png"
      />
      <main className="min-h-screen">
        <Hero />
        <HowItWorks />
        <PlatformShowcase />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}