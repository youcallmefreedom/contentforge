import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Copy, Check, Trash2, Library as LibraryIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type SavedPost = {
  id: string;
  platform: string;
  format: string;
  content: string;
  tags: string[];
  is_evergreen: boolean;
  created_at: string;
};

const platformLabels: Record<string, string> = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  linkedin_carousel: "LinkedIn Carousel",
  instagram: "Instagram",
  facebook: "Facebook",
  newsletter: "Newsletter",
  youtube_shorts: "YouTube Shorts",
};

const platformColors: Record<string, string> = {
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  linkedin_carousel: "bg-blue-600",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  newsletter: "bg-purple-600",
  youtube_shorts: "bg-red-600",
};

export default function Library() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SavedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [selectedPost, setSelectedPost] = useState<SavedPost | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, platformFilter]);

  const fetchPosts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("saved_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(data as SavedPost[]);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    if (platformFilter !== "all") {
      filtered = filtered.filter((p) => p.platform === platformFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const deletePost = async (id: string) => {
    await supabase.from("saved_posts").delete().eq("id", id);
    fetchPosts();
    setSelectedPost(null);
    toast({ title: "Post deleted" });
  };

  if (loading || !user) {
    return null;
  }

  return (
    <AppLayout>
      <SEO title="Content Library - ContentForge" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold">Content Library</h1>
          <p className="text-muted-foreground mt-1">Your saved posts and evergreen content</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {Object.entries(platformLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <LibraryIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {posts.length === 0
                ? "No saved posts yet. Save posts from the Generate page to build your library."
                : "No posts match your filters."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${platformColors[post.platform]} text-white`}>
                      {platformLabels[post.platform]}
                    </Badge>
                    {post.is_evergreen && (
                      <Badge variant="outline" className="text-xs">
                        Evergreen
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-4">{post.content}</p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost && platformLabels[selectedPost.platform]}
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`${platformColors[selectedPost.platform]} text-white`}>
                  {platformLabels[selectedPost.platform]}
                </Badge>
                {selectedPost.is_evergreen && (
                  <Badge variant="outline">Evergreen</Badge>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {selectedPost.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={() => copyContent(selectedPost.content)} className="flex-1">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Content
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deletePost(selectedPost.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}