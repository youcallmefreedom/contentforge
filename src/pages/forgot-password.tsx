import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
      toast({
        title: "Check your email",
        description: "We sent you a password reset link.",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <SEO title="Forgot Password - ContentForge" />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-heading font-bold">CF</span>
              </div>
              <span className="font-heading font-bold text-2xl">ContentForge</span>
            </Link>
            <h1 className="text-2xl font-heading font-bold mt-6">Reset your password</h1>
            <p className="text-muted-foreground mt-2">
              {sent ? "Check your email for the reset link" : "Enter your email to receive a reset link"}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 text-primary rounded-lg">
                Password reset link sent to {email}
              </div>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Send to a different email
              </Button>
            </div>
          )}

          <div className="mt-6">
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}