import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { generationId, outputs } = req.body;

    // Platform scheduling rules
    const scheduleRules: Record<string, Array<{ day: number; time: string }>> = {
      twitter: [
        { day: 0, time: "08:00:00" }, // Monday
        { day: 2, time: "08:00:00" }, // Wednesday
        { day: 4, time: "08:00:00" }, // Friday
      ],
      linkedin: [
        { day: 1, time: "07:00:00" }, // Tuesday
        { day: 3, time: "17:00:00" }, // Thursday
      ],
      linkedin_carousel: [{ day: 2, time: "10:00:00" }], // Wednesday
      instagram: [
        { day: 2, time: "12:00:00" }, // Wednesday
        { day: 5, time: "19:00:00" }, // Saturday
      ],
      facebook: [
        { day: 0, time: "13:00:00" }, // Monday
        { day: 3, time: "14:00:00" }, // Thursday
      ],
      newsletter: [{ day: 1, time: "10:00:00" }], // Tuesday
      youtube_shorts: [{ day: 4, time: "15:00:00" }], // Friday
    };

    // Get Monday of this week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const calendarItems = [];

    for (const output of outputs) {
      const rules = scheduleRules[output.platform];
      if (!rules || rules.length === 0) continue;

      const rule = rules[0]; // Use first slot for each platform
      const scheduledDate = new Date(monday);
      scheduledDate.setDate(scheduledDate.getDate() + rule.day);

      calendarItems.push({
        user_id: user.id,
        generation_id: generationId,
        platform: output.platform,
        content: output.content,
        format: output.format,
        scheduled_date: scheduledDate.toISOString().split("T")[0],
        scheduled_time: rule.time,
        status: "planned",
      });
    }

    const { error: insertError } = await supabase
      .from("calendar_items")
      .insert(calendarItems);

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Failed to create calendar items" });
    }

    return res.status(200).json({ message: "Week planned successfully", count: calendarItems.length });
  } catch (error: any) {
    console.error("Plan week error:", error);
    return res.status(500).json({ error: error.message || "Failed to plan week" });
  }
}