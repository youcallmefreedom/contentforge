import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user!.id);

    if (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  if (loading || !user || !profile) {
    return null;
  }

  const tier = (profile as any)?.subscription_tier || "free";
  const tierLabels = {
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    agency: "Agency",
  };

  return (
    <AppLayout>
      <SEO title="Settings - ContentForge" />

      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-heading font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ""} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed. Contact support for help.
                </p>
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-heading font-semibold mb-4">Usage Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Repurposes</p>
                  <p className="text-2xl font-heading font-bold">
                    {(profile as any)?.monthly_generations || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-lg font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold text-lg">Current Plan</h3>
                  <Badge className="mt-2 bg-primary">
                    {tierLabels[tier as keyof typeof tierLabels]}
                  </Badge>
                </div>
                {tier === "free" && (
                  <Button>Upgrade Plan</Button>
                )}
              </div>

              {tier === "free" ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upgrade to unlock more repurposes, brand voices, and advanced features.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <h4 className="font-heading font-semibold">Starter</h4>
                      <p className="text-2xl font-heading font-bold mt-2">$15<span className="text-sm font-normal">/mo</span></p>
                      <ul className="text-sm space-y-1 mt-3">
                        <li>✓ 30 repurposes/month</li>
                        <li>✓ 1 brand voice</li>
                        <li>✓ Calendar & library</li>
                      </ul>
                      <Button className="w-full mt-4" size="sm">Select</Button>
                    </Card>
                    <Card className="p-4 border-primary">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-semibold">Pro</h4>
                        <Badge className="bg-accent text-white text-xs">Popular</Badge>
                      </div>
                      <p className="text-2xl font-heading font-bold mt-2">$29<span className="text-sm font-normal">/mo</span></p>
                      <ul className="text-sm space-y-1 mt-3">
                        <li>✓ Unlimited repurposes</li>
                        <li>✓ 3 brand voices</li>
                        <li>✓ RSS monitoring</li>
                      </ul>
                      <Button className="w-full mt-4" size="sm">Select</Button>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-heading font-semibold">Agency</h4>
                      <p className="text-2xl font-heading font-bold mt-2">$79<span className="text-sm font-normal">/mo</span></p>
                      <ul className="text-sm space-y-1 mt-3">
                        <li>✓ Everything in Pro</li>
                        <li>✓ 10 client workspaces</li>
                        <li>✓ 5 team seats</li>
                      </ul>
                      <Button className="w-full mt-4" size="sm">Select</Button>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage your subscription through the customer portal.
                  </p>
                  <Button variant="outline">Manage Subscription</Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-heading font-semibold mb-4">Preferences</h3>
              <p className="text-sm text-muted-foreground">
                Notification and display preferences coming soon.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}