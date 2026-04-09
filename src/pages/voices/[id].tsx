import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Sparkles, Plus, X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type SamplePost = {
  platform: string;
  content: string;
};

export default function VoiceEditor() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [samplePosts, setSamplePosts] = useState<SamplePost[]>([
    { platform: "twitter", content: "" },
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [voiceAttributes, setVoiceAttributes] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (id && id !== "new" && user) {
      fetchVoice();
    }
  }, [id, user]);

  const fetchVoice = async () => {
    const { data } = await supabase
      .from("brand_voices")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setName(data.name);
      setDescription(data.description);
      setVoiceAttributes(data.voice_attributes);
      if (data.sample_posts && Array.isArray(data.sample_posts)) {
        setSamplePosts(data.sample_posts);
      }
    }
  };

  const addSamplePost = () => {
    setSamplePosts([...samplePosts, { platform: "twitter", content: "" }]);
  };

  const removeSamplePost = (index: number) => {
    setSamplePosts(samplePosts.filter((_, i) => i !== index));
  };

  const updateSamplePost = (index: number, field: "platform" | "content", value: string) => {
    const updated = [...samplePosts];
    updated[index][field] = value;
    setSamplePosts(updated);
  };

  const analyzeVoice = async () => {
    setAnalyzing(true);

    try {
      const response = await fetch("/api/voices/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samplePosts }),
      });

      const data = await response.json();

      if (data.attributes) {
        setVoiceAttributes(data.attributes);
        toast({ title: "Voice analysis complete!" });
      }
    } catch (error) {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const saveVoice = async () => {
    if (!name || !description) {
      toast({ title: "Name and description required", variant: "destructive" });
      return;
    }

    const voiceData = {
      user_id: user!.id,
      name,
      description,
      sample_posts: samplePosts,
      voice_attributes: voiceAttributes || {},
      system_prompt: voiceAttributes
        ? `You are writing in ${name}'s voice. Tone: ${voiceAttributes.tone}/10 (1=formal, 10=casual). Vocabulary: ${voiceAttributes.vocabulary_level}. Emoji usage: ${voiceAttributes.emoji_usage}. Humor: ${voiceAttributes.humor_level}.`
        : "",
      is_default: false,
    };

    if (id === "new") {
      const { error } = await supabase.from("brand_voices").insert(voiceData);
      if (!error) {
        toast({ title: "Voice created!" });
        router.push("/voices");
      }
    } else {
      const { error } = await supabase
        .from("brand_voices")
        .update(voiceData)
        .eq("id", id);
      if (!error) {
        toast({ title: "Voice updated!" });
        router.push("/voices");
      }
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <AppLayout>
      <SEO title={`${id === "new" ? "Create" : "Edit"} Brand Voice - ContentForge`} />

      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/voices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {id === "new" ? "Create Brand Voice" : "Edit Brand Voice"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Train AI by pasting 3-10 of your best-performing posts
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="p-6 space-y-4">
          <div>
            <Label htmlFor="name">Voice Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Professional LinkedIn, Casual Twitter"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this voice and when to use it..."
              rows={3}
            />
          </div>
        </Card>

        {/* Sample Posts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg">Sample Posts</h3>
            <Button onClick={addSamplePost} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </div>
          <div className="space-y-4">
            {samplePosts.map((post, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Select
                    value={post.platform}
                    onValueChange={(value) => updateSamplePost(index, "platform", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSamplePost(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={post.content}
                  onChange={(e) => updateSamplePost(index, "content", e.target.value)}
                  placeholder="Paste your post content here..."
                  rows={4}
                />
              </div>
            ))}
          </div>
          <Button
            onClick={analyzeVoice}
            disabled={analyzing || samplePosts.filter((p) => p.content).length < 3}
            className="w-full mt-4"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {analyzing ? "Analyzing..." : "Analyze My Voice"}
          </Button>
        </Card>

        {/* Voice Profile */}
        {voiceAttributes && (
          <Card className="p-6">
            <h3 className="font-heading font-semibold text-lg mb-4">Voice Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tone (1=formal, 10=casual)</p>
                <p className="text-2xl font-heading font-bold">{voiceAttributes.tone}/10</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Vocabulary Level</p>
                <p className="text-2xl font-heading font-bold">{voiceAttributes.vocabulary_level}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Emoji Usage</p>
                <p className="text-2xl font-heading font-bold">{voiceAttributes.emoji_usage}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Humor Level</p>
                <p className="text-2xl font-heading font-bold">{voiceAttributes.humor_level}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={saveVoice} className="flex-1">
            Save Voice
          </Button>
          <Link href="/voices">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}