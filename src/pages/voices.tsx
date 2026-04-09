import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic2, Plus, Trash2, Edit, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type BrandVoice = {
  id: string;
  name: string;
  description: string;
  voice_attributes: {
    tone: number;
    vocabulary_level: string;
    emoji_usage: string;
    humor_level: string;
  };
  is_default: boolean;
  created_at: string;
};

export default function Voices() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<BrandVoice | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchVoices();
    }
  }, [user]);

  const fetchVoices = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("brand_voices")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });

    if (data) {
      setVoices(data as BrandVoice[]);
    }
  };

  const deleteVoice = async (id: string) => {
    await supabase.from("brand_voices").delete().eq("id", id);
    fetchVoices();
    setSelectedVoice(null);
    toast({ title: "Voice deleted" });
  };

  const setDefault = async (id: string) => {
    // Unset all defaults
    await supabase
      .from("brand_voices")
      .update({ is_default: false })
      .eq("user_id", user!.id);

    // Set new default
    await supabase
      .from("brand_voices")
      .update({ is_default: true })
      .eq("id", id);

    fetchVoices();
    toast({ title: "Default voice updated" });
  };

  if (loading || !user) {
    return null;
  }

  const tier = (profile as any)?.subscription_tier || "free";
  const limits = { free: 0, starter: 1, pro: 3, agency: 10 };
  const limit = limits[tier as keyof typeof limits];

  return (
    <AppLayout>
      <SEO title="Brand Voices - ContentForge" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Brand Voices</h1>
            <p className="text-muted-foreground mt-1">
              Train AI to sound like you — {voices.length} of {limit === 0 ? "0" : limit} voices
            </p>
          </div>
          {(tier === "free" || voices.length < limit) && (
            <Link href="/voices/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Voice
              </Button>
            </Link>
          )}
        </div>

        {/* Upgrade prompt for free users */}
        {tier === "free" && (
          <Card className="p-6 border-accent bg-accent/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Mic2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-lg">Unlock Brand Voices</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upgrade to Starter to train AI on your writing style. Your content will sound authentic, not robotic.
                </p>
                <Link href="/settings">
                  <Button className="mt-4" size="sm">
                    Upgrade to Starter
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Voices Grid */}
        {voices.length === 0 ? (
          <Card className="p-12 text-center">
            <Mic2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {tier === "free"
                ? "Upgrade to create your first brand voice."
                : "Create your first brand voice to make AI content sound like you."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voices.map((voice) => (
              <Card
                key={voice.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedVoice(voice)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-semibold text-lg">{voice.name}</h3>
                    {voice.is_default && (
                      <Badge className="bg-accent text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {voice.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Tone: {voice.voice_attributes?.tone || 5}/10
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {voice.voice_attributes?.emoji_usage || "Light"} emojis
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {voice.voice_attributes?.humor_level || "Witty"}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Voice Detail Modal */}
      <Dialog open={!!selectedVoice} onOpenChange={() => setSelectedVoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVoice?.name}</DialogTitle>
          </DialogHeader>
          {selectedVoice && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedVoice.description}</p>

              <div className="space-y-2">
                <h4 className="font-medium">Voice Attributes</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Tone</p>
                    <p className="font-medium">{selectedVoice.voice_attributes?.tone || 5}/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vocabulary</p>
                    <p className="font-medium">{selectedVoice.voice_attributes?.vocabulary_level || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emoji Usage</p>
                    <p className="font-medium">{selectedVoice.voice_attributes?.emoji_usage || "Light"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Humor Level</p>
                    <p className="font-medium">{selectedVoice.voice_attributes?.humor_level || "Witty"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!selectedVoice.is_default && (
                  <Button onClick={() => setDefault(selectedVoice.id)} className="flex-1">
                    <Star className="mr-2 h-4 w-4" />
                    Set as Default
                  </Button>
                )}
                <Link href={`/voices/${selectedVoice.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={() => deleteVoice(selectedVoice.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}