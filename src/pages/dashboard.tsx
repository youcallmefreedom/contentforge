import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Facebook, 
  Mail, 
  Youtube,
  Presentation,
  Clock,
  HelpCircle
} from "lucide-react";
import { Joyride, STATUS, Step } from "react-joyride";

type GenerationSummary = {
  id: string;
  input_title: string;
  outputs: any[];
  created_at: string;
};

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  linkedin_carousel: Presentation,
  instagram: Instagram,
  facebook: Facebook,
  newsletter: Mail,
  youtube_shorts: Youtube,
};

const platformColors = {
  twitter: "bg-sky-100 text-sky-700 border-sky-300",
  linkedin: "bg-blue-100 text-blue-700 border-blue-300",
  linkedin_carousel: "bg-blue-100 text-blue-700 border-blue-300",
  instagram: "bg-pink-100 text-pink-700 border-pink-300",
  facebook: "bg-blue-100 text-blue-800 border-blue-300",
  newsletter: "bg-purple-100 text-purple-700 border-purple-300",
  youtube_shorts: "bg-red-100 text-red-700 border-red-300",
};

export default function Dashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    avgScore: 0,
    thisMonth: 0,
  });
  const [recentGenerations, setRecentGenerations] = useState<GenerationSummary[]>([]);
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  const [tourSteps] = useState<Step[]>([
    {
      target: ".tour-stats",
      content: "These cards show your overall repurposing performance and usage for the current billing cycle.",
      placement: "bottom",
    },
    {
      target: ".tour-usage",
      content: "Keep track of your monthly generations here. You can upgrade your plan if you need more.",
      placement: "left",
    },
    {
      target: ".tour-quick-actions",
      content: "Use these shortcuts to start a new generation, check your calendar, or browse your library.",
      placement: "top",
    },
    {
      target: ".tour-recent",
      content: "Your most recent repurposed content will appear here for quick access.",
      placement: "top",
    }
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      checkTourStatus();
    }
  }, [user]);

  const checkTourStatus = () => {
    const completed = localStorage.getItem("contentforge_tour_completed");
    if (!completed) {
      setTimeout(() => setRunTour(true), 500);
    } else {
      setTourCompleted(true);
    }
  };

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem("contentforge_tour_completed", "true");
      setTourCompleted(true);
    }
  };

  const restartTour = () => {
    setRunTour(true);
  };

  useEffect(() => {
    if (!profile) return;
    
    const planLimits = {
      free: 3,
      starter: 30,
      pro: 999999,
      agency: 999999,
    };
    
    const limit = planLimits[(profile as any).subscription_tier as keyof typeof planLimits] || 3;
    const usage = (profile as any).monthly_generations || 0;
    const usagePercent = limit === 999999 ? 0 : (usage / limit) * 100;

    if (usagePercent >= 80) {
      const hasShown = sessionStorage.getItem("usage_warning_shown");
      if (!hasShown) {
        setTimeout(() => {
          toast({
            title: "Approaching Usage Limit",
            description: `You've used ${Math.round(usagePercent)}% of your monthly generations (${usage} of ${limit}).`,
          });
        }, 1000);
        sessionStorage.setItem("usage_warning_shown", "true");
      }
    }
  }, [profile, toast]);

  const fetchDashboardData = async () => {
    try {
      const { data: generations, error } = await supabase
        .from("generations")
        .select("id, input_title, outputs, content_scores, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (generations) {
        setRecentGenerations(generations as unknown as GenerationSummary[]);

        const total = generations.length;
        const scores = generations
          .flatMap((g: any) => {
            const outputs = g.outputs || [];
            return outputs.map((o: any) => o.content_score || 0);
          })
          .filter((s: number) => s > 0);

        const avgScore = scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : 0;

        const now = new Date();
        const thisMonth = generations.filter((g: any) => {
          const createdAt = new Date(g.created_at);
          return createdAt.getMonth() === now.getMonth() && 
                 createdAt.getFullYear() === now.getFullYear();
        }).length;

        setStats({ totalGenerations: total, avgScore, thisMonth });
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !profile) {
    return null;
  }

  const planLimits = {
    free: 3,
    starter: 30,
    pro: 999999,
    agency: 999999,
  };

  const limit = planLimits[(profile as any).subscription_tier as keyof typeof planLimits] || 3;
  const usage = (profile as any).monthly_generations || 0;
  const usagePercent = limit === 999999 ? 0 : (usage / limit) * 100;

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <AppLayout>
      <SEO title="Dashboard — ContentForge" />
      
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#0d9488",
            textColor: "#0f172a",
            zIndex: 1000,
          },
        } as any}
      />

      <div className="container py-8 space-y-8 tour-welcome">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Welcome back, {firstName}! 👋</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your content
            </p>
          </div>
          {tourCompleted && (
            <Button variant="outline" size="sm" onClick={restartTour}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Restart Tour
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 tour-stats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGenerations}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time repurposes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Content Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}/10</div>
              <p className="text-xs text-muted-foreground mt-1">
                Predicted engagement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Repurposes created
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="tour-usage">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usage This Month</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {usage} of {limit === 999999 ? "unlimited" : limit} repurposes
                </p>
              </div>
              {(profile as any).subscription_tier === "free" && usage >= limit && (
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercent} className="h-2" />
            {(profile as any).subscription_tier === "free" && usage >= limit && (
              <p className="text-sm text-destructive mt-2">
                You've reached your monthly limit. Upgrade to continue creating content.
              </p>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="font-heading text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4 tour-quick-actions">
            <Link href="/generate">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">New Repurpose</h3>
                      <p className="text-sm text-muted-foreground">
                        Turn a blog into 7 posts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/calendar">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Content Calendar</h3>
                      <p className="text-sm text-muted-foreground">
                        Plan your week ahead
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/library">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Saved Library</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse saved posts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="tour-recent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">Recent Generations</h2>
            <Link href="/generate">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {recentGenerations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No generations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first content repurpose to get started
                </p>
                <Link href="/generate">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Your First Repurpose
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentGenerations.map((gen) => {
                const outputs = gen.outputs || [];
                return (
                  <Card key={gen.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate mb-2">{gen.input_title}</h3>
                          <div className="flex flex-wrap gap-2">
                            {outputs.map((output: any, idx: number) => {
                              const Icon = platformIcons[output.platform as keyof typeof platformIcons];
                              const colorClass = platformColors[output.platform as keyof typeof platformColors];
                              return (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className={`${colorClass} border`}
                                >
                                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                                  {output.platform.replace("_", " ")}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 ml-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(gen.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Link href={`/generate?id=${gen.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}