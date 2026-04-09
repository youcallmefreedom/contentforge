import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function Settings() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async (plan: "starter" | "pro" | "agency") => {
    setCheckoutLoading(plan);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Checkout failed");

      const stripe = await stripePromise;
      if (stripe && data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`,
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Portal creation failed");

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || !user || !profile) {
    return null;
  }

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      features: ["3 repurposes/month", "All 7 output formats", "Content scores", "Basic calendar"],
      current: (profile as any).subscription_tier === "free",
    },
    {
      id: "starter",
      name: "Starter",
      price: "$15",
      features: ["30 repurposes/month", "1 Brand Voice", "Calendar with CSV export", "Content library"],
      current: (profile as any).subscription_tier === "starter",
    },
    {
      id: "pro",
      name: "Pro",
      price: "$29",
      popular: true,
      features: ["Unlimited repurposes", "3 Brand Voices", "RSS auto-monitoring", "Priority AI speed"],
      current: (profile as any).subscription_tier === "pro",
    },
    {
      id: "agency",
      name: "Agency",
      price: "$79",
      features: ["Everything in Pro", "10 client workspaces", "5 team seats", "White-label exports"],
      current: (profile as any).subscription_tier === "agency",
    },
  ];

  return (
    <AppLayout>
      <SEO title="Settings — ContentForge" />
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Generations</span>
                  <span className="font-semibold">{(profile as any).monthly_generations || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <Badge>{((profile as any).subscription_tier || "free").toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={(profile as any).subscription_status === "active" ? "default" : "secondary"}>
                    {((profile as any).subscription_status || "active").toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={plan.popular ? "border-primary shadow-lg" : ""}>
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {plan.current && (
                        <Badge variant="outline" className="ml-2">
                          <Check className="h-3 w-3 mr-1" /> Current
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="text-3xl font-bold">{plan.price}</div>
                    <CardDescription>per month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-start">
                          <Check className="h-4 w-4 mr-2 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.id === "free" ? (
                      plan.current ? (
                        <Button variant="outline" disabled className="w-full">
                          Current Plan
                        </Button>
                      ) : null
                    ) : (
                      <Button
                        onClick={() => handleCheckout(plan.id as "starter" | "pro" | "agency")}
                        disabled={plan.current || checkoutLoading !== null}
                        className="w-full"
                        variant={plan.current ? "outline" : "default"}
                      >
                        {checkoutLoading === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {plan.current ? "Current Plan" : "Upgrade"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {(profile as any).subscription_tier !== "free" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Subscription</CardTitle>
                  <CardDescription>
                    Update payment method, view invoices, or cancel your subscription
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleManageSubscription} disabled={portalLoading}>
                    {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Open Billing Portal
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your ContentForge experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notification and preference settings coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}