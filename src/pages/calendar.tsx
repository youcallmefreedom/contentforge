import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type CalendarItem = {
  id: string;
  platform: string;
  content: string;
  format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
};

const platformColors: Record<string, string> = {
  twitter: "bg-sky-500 border-sky-600",
  linkedin: "bg-blue-700 border-blue-800",
  linkedin_carousel: "bg-blue-600 border-blue-700",
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500 border-pink-600",
  facebook: "bg-blue-600 border-blue-700",
  newsletter: "bg-purple-600 border-purple-700",
  youtube_shorts: "bg-red-600 border-red-700",
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

export default function Calendar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCalendarItems();
    }
  }, [user, weekOffset]);

  const fetchCalendarItems = async () => {
    if (!user) return;

    const startDate = getWeekStart(weekOffset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const { data } = await supabase
      .from("calendar_items")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_date", startDate.toISOString().split("T")[0])
      .lte("scheduled_date", endDate.toISOString().split("T")[0])
      .order("scheduled_time");

    if (data) {
      setItems(data as CalendarItem[]);
    }
  };

  const getWeekStart = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7;
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const getWeekDays = () => {
    const start = getWeekStart(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const getItemsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return items.filter((item) => item.scheduled_date === dateStr);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from("calendar_items")
      .update({ status })
      .eq("id", id);

    fetchCalendarItems();
    toast({ title: `Marked as ${status}` });
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const exportCSV = () => {
    const csv = [
      "Platform,Content,Date,Time,Status",
      ...items.map((item) =>
        [
          platformLabels[item.platform],
          `"${item.content.replace(/"/g, '""')}"`,
          item.scheduled_date,
          item.scheduled_time,
          item.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contentforge-calendar-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Calendar exported!" });
  };

  if (loading || !user) {
    return null;
  }

  const weekDays = getWeekDays();
  const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <AppLayout>
      <SEO title="Content Calendar - ContentForge" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Content Calendar</h1>
            <p className="text-muted-foreground mt-1">Plan and track your weekly posts</p>
          </div>
          <Button onClick={exportCSV} variant="outline">
            Export CSV
          </Button>
        </div>

        {/* Week Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset - 1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="font-heading font-semibold">
                {weekDays[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
                {weekDays[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
              {weekOffset === 0 && (
                <p className="text-sm text-muted-foreground">This Week</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const dayItems = getItemsForDay(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={date.toISOString()}>
                <div className={`mb-3 ${isToday ? "text-primary" : ""}`}>
                  <p className="font-heading font-semibold">{dayLabels[index]}</p>
                  <p className="text-sm text-muted-foreground">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="space-y-2">
                  {dayItems.length === 0 ? (
                    <Card className="p-4 text-center border-dashed">
                      <p className="text-sm text-muted-foreground">No posts</p>
                    </Card>
                  ) : (
                    dayItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                          platformColors[item.platform]
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {platformLabels[item.platform]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.scheduled_time.slice(0, 5)}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{item.content}</p>
                          <Badge
                            variant={
                              item.status === "published"
                                ? "default"
                                : item.status === "skipped"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem && platformLabels[selectedItem.platform]}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  {new Date(selectedItem.scheduled_date).toLocaleDateString()}
                </Badge>
                <Badge variant="secondary">{selectedItem.scheduled_time.slice(0, 5)}</Badge>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="whitespace-pre-wrap">{selectedItem.content}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => copyContent(selectedItem.content)} className="flex-1">
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedItem.status}
                  onValueChange={(value) => updateStatus(selectedItem.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="skipped">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}