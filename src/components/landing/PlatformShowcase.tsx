import { Twitter, Linkedin, Instagram, Facebook, Mail, Youtube, Presentation } from "lucide-react";

export function PlatformShowcase() {
  const platforms = [
    { name: "Twitter Thread", icon: Twitter, color: "text-[#1DA1F2]", bg: "bg-[#1DA1F2]/10" },
    { name: "LinkedIn Post", icon: Linkedin, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10" },
    { name: "LinkedIn Carousel", icon: Presentation, color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10" },
    { name: "Instagram Caption", icon: Instagram, color: "text-[#E4405F]", bg: "bg-[#E4405F]/10" },
    { name: "Facebook Post", icon: Facebook, color: "text-[#1877F2]", bg: "bg-[#1877F2]/10" },
    { name: "Email Newsletter", icon: Mail, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10" },
    { name: "YouTube Shorts", icon: Youtube, color: "text-[#FF0000]", bg: "bg-[#FF0000]/10" },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">7 Platforms, One Click</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get platform-optimized content for every major social network
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-6xl mx-auto">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.name} className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className={`w-12 h-12 rounded-full ${platform.bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${platform.color}`} />
                </div>
                <span className="text-sm font-medium text-center">{platform.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}