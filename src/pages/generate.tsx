import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  Youtube,
  Presentation,
  Sparkles,
  Link as LinkIcon,
  FileText,
  Copy,
  Save,
  RefreshCw,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PlatformOutput = {
  platform: string;
  format: string;
  content: string;
  char_count: number;
  content_score: number;
  score_reason: string;
  tweets?: string[];
  slides?: Array<{ slide_number: number; headline: string; body: string }>;
  subject_line?: string;
  preview_text?: string;
  hook?: string;
  body?: string;
  cta?: string;
  hashtags?: string[];
};

export default function Generate() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [voiceId, setVoiceId] = useState("default");
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<PlatformOutput[]>([]);
  const [activeTab, setActiveTab] = useState("twitter");
  const [generationId, setGenerationId] = useState<string | null>(null);

  const planLimits = {
    free: 3,
    starter: 30,
    pro: 999999,
    agency: 999999,
  };

  const limit = planLimits[(profile as any)?.subscription_tier as keyof typeof planLimits] || 3;
  const usage = (profile as any)?.monthly_generations || 0;
  const usagePercent = limit === 999999 ? 0 : (usage / limit) * 100;

  const handleGenerate = async () => {
    if (inputMode === "url" && !url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a blog URL to repurpose.",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === "text" && (!title.trim() || !content.trim())) {
      toast({
        title: "Content required",
        description: "Please enter both a title and content to repurpose.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setOutputs([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          inputMode,
          url,
          title,
          content,
          voiceId: voiceId === "default" ? null : voiceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setOutputs(data.outputs);
      setGenerationId(data.generationId);

      toast({
        title: "Content Generated!",
        description: "Your 7 platform posts are ready.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: `${platform} content copied to clipboard.`,
    });
  };

  const handleSave = async (output: PlatformOutput) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("saved_posts").insert({
        user_id: user.id,
        generation_id: generationId || null,
        platform: output.platform,
        format: output.format,
        content: output.content,
        tags: [],
        is_evergreen: false,
      });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Added to your library.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePlanWeek = () => {
    if (generationId) {
      router.push(`/calendar?schedule=${generationId}`);
    }
  };

  const platformIcons: Record<string, any> = {
    twitter: Twitter,
    linkedin: Linkedin,
    linkedin_carousel: Presentation,
    instagram: Instagram,
    facebook: Facebook,
    newsletter: Mail,
    youtube_shorts: Youtube,
  };

  const getScoreBadge = (score: number) => {
    if (score >= 9) return { color: "bg-yellow-500 text-white", label: "Viral Potential" };
    if (score >= 7) return { color: "bg-green-600 text-white", label: "Good" };
    if (score >= 4) return { color: "bg-yellow-600 text-white", label: "Average" };
    return { color: "bg-red-600 text-white", label: "Low" };
  };

  const renderOutput = (output: PlatformOutput) => {
    const Icon = platformIcons[output.platform];
    const scoreBadge = getScoreBadge(output.content_score);

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6 text-primary" />}
            <div>
              <h3 className="font-heading font-semibold text-lg capitalize">
                {output.platform.replace("_", " ")}
              </h3>
              <p className="text-sm text-muted-foreground">{output.format}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {output.char_count} chars
            </Badge>
            <Badge className={`text-xs ${scoreBadge.color}`}>
              {output.content_score}/10 · {scoreBadge.label}
            </Badge>
          </div>
        </div>

        <Card className="p-4 bg-muted/30">
          {output.platform === "twitter" && output.tweets ? (
            <div className="space-y-3">
              {output.tweets.map((tweet, idx) => (
                <div key={idx} className="bg-background p-4 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {idx + 1}/{output.tweets!.length}
                      </span>
                    </div>
                    <p className="flex-1 whitespace-pre-wrap text-sm">{tweet}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : output.platform === "linkedin_carousel" && output.slides ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {output.slides.map((slide) => (
                <div
                  key={slide.slide_number}
                  className="bg-background p-4 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">
                        {slide.slide_number}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-sm mb-2">{slide.headline}</p>
                      <p className="text-sm text-muted-foreground">{slide.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : output.platform === "newsletter" ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Subject Line</Label>
                <p className="font-semibold">{output.subject_line}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Preview Text</Label>
                <p className="text-sm text-muted-foreground">{output.preview_text}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Body</Label>
                <p className="whitespace-pre-wrap text-sm">{output.content}</p>
              </div>
            </div>
          ) : output.platform === "youtube_shorts" ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-red-600">[HOOK - 0-5 sec]</Label>
                <p className="text-sm mt-1">{output.hook}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-blue-600">[BODY - 5-45 sec]</Label>
                <p className="whitespace-pre-wrap text-sm mt-1">{output.body}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-green-600">[CTA - 45-60 sec]</Label>
                <p className="text-sm mt-1">{output.cta}</p>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{output.content}</p>
          )}
        </Card>

        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Why this scores {output.content_score}/10:</strong> {output.score_reason}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy(output.content, output.platform)}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(output)}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <SEO title="Generate Content - ContentForge" />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Generate Content</h1>
          <p className="text-muted-foreground mt-2">
            Turn one blog post into a week of social media content
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT PANEL - Input */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                {/* Input Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={inputMode === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("url")}
                    className="flex-1"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Paste URL
                  </Button>
                  <Button
                    variant={inputMode === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputMode("text")}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Paste Text
                  </Button>
                </div>

                {/* URL Mode */}
                {inputMode === "url" && (
                  <div className="space-y-2">
                    <Label>Blog Post URL</Label>
                    <Input
                      placeholder="https://yourblog.com/post"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Text Mode */}
                {inputMode === "text" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Enter blog post title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        placeholder="Paste your blog post content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        disabled={loading}
                        className="resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Brand Voice Selector */}
                <div className="space-y-2">
                  <Label htmlFor="voice">Brand Voice</Label>
                  <Select value={voiceId} onValueChange={setVoiceId}>
                    <SelectTrigger id="voice">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Voice</SelectItem>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={loading || usage >= limit}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Repurpose Content
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Usage Meter */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Usage This Month</p>
                  <p className="text-sm text-muted-foreground">
                    {usage} / {limit === 999999 ? "∞" : limit}
                  </p>
                </div>
                {limit !== 999999 && <Progress value={usagePercent} className="h-2" />}
                {usage >= limit && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-destructive">Limit Reached</p>
                      <p className="text-xs text-destructive/80 mt-1">
                        Upgrade to continue generating content
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT PANEL - Output */}
          <div>
            {outputs.length === 0 && !loading && (
              <Card className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {inputMode === "url"
                    ? "Paste a blog post URL and click Repurpose"
                    : "Enter your content and click Repurpose"}
                </p>
              </Card>
            )}

            {loading && (
              <Card className="p-12">
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                  <div className="space-y-2">
                    <p className="text-center font-medium">Generating your content...</p>
                    <p className="text-center text-sm text-muted-foreground">
                      Creating 7 platform-specific posts
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {outputs.length > 0 && (
              <div className="space-y-4">
                <Tabs defaultValue="twitter" className="w-full">
                  <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
                    <TabsTrigger value="twitter" className="text-xs">
                      <Twitter className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="text-xs">
                      <Linkedin className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="linkedin_carousel" className="text-xs">
                      <Presentation className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="instagram" className="text-xs">
                      <Instagram className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="facebook" className="text-xs">
                      <Facebook className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="newsletter" className="text-xs">
                      <Mail className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="youtube_shorts" className="text-xs">
                      <Youtube className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>

                  {outputs.map((output) => (
                    <TabsContent key={output.platform} value={output.platform} className="mt-4">
                      {renderOutput(output)}
                    </TabsContent>
                  ))}
                </Tabs>

                <Button onClick={handlePlanWeek} size="lg" className="w-full">
                  Plan This Week
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}