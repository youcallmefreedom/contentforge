import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  Library,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";

type GenerationSummary = {
  id: string;
  input_title: string;
  created_at: string;
  outputs: Array<{ platform: string; content_score: number }>;
};

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [recentGenerations, setRecentGenerations] = useState<GenerationSummary[]>([]);
  const [stats, setStats] = useState({
    totalGenerations: 0,
    thisMonth: 0,
    avgScore: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    const { data: generations } = await supabase
      .from("generations")
      .select("id, input_title, created_at, outputs")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (generations) {
      setRecentGenerations(generations);

      const total = generations.length;
      const thisMonth = generations.filter((g) => {
        const date = new Date(g.created_at);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      const allScores = generations.flatMap((g) =>
        Array.isArray(g.outputs) ? g.outputs.map((o: any) => o.content_score || 0) : []
      );
      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      setStats({ totalGenerations: total, thisMonth, avgScore });
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

  const limit = planLimits[profile.subscription_tier as keyof typeof planLimits] || 3;
  const usage = profile.monthly_generations || 0;
  const usagePercent = limit === 999999 ? 0 : (usage / limit) * 100;

  return (
    <AppLayout>
      <SEO title="Dashboard - ContentForge" />

      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Welcome back, {profile.full_name?.split(" ")[0] || "there"}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to turn your content into a week of social posts?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Generations</p>
                <p className="text-2xl font-heading font-bold">{stats.totalGenerations}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Content Score</p>
                <p className="text-2xl font-heading font-bold">{stats.avgScore}/10</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-heading font-bold">{stats.thisMonth}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Usage Meter */}
        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-semibold">Usage This Month</p>
                <p className="text-sm text-muted-foreground">
                  {usage} of {limit === 999999 ? "unlimited" : limit} repurposes
                </p>
              </div>
              {profile.subscription_tier === "free" && usage >= limit && (
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
            {limit !== 999999 && <Progress value={usagePercent} className="h-2" />}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/generate">
            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">New Repurpose</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn a blog post into 7 platform posts
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Card>
          </Link>

          <Link href="/calendar">
            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">Content Calendar</h3>
                  <p className="text-sm text-muted-foreground">
                    View and plan your week
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Card>
          </Link>

          <Link href="/library">
            <Card className="p-6 hover:border-primary/50 transition-colors cursor-pointer h-full">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Library className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">Saved Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse your saved posts
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Generations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-heading font-bold">Recent Generations</h2>
            <Link href="/library">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentGenerations.length === 0 ? (
            <Card className="p-12 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No generations yet. Create your first one!</p>
              <Link href="/generate">
                <Button className="mt-4">
                  Start Generating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentGenerations.map((gen) => {
                const avgScore = Array.isArray(gen.outputs)
                  ? Math.round(
                      gen.outputs.reduce((sum: number, o: any) => sum + (o.content_score || 0), 0) /
                        gen.outputs.length
                    )
                  : 0;

                return (
                  <Card key={gen.id} className="p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{gen.input_title}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(gen.created_at).toLocaleDateString()}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Score: {avgScore}/10
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Link href={`/library?id=${gen.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
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