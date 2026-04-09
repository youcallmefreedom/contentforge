import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { inputMode, url, title, content, voiceId } = req.body;

    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get or create user profile
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_tier, monthly_generations")
      .eq("id", user.id)
      .single();

    // Fallback: Create profile if it doesn't exist
    if (profileError || !profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          subscription_tier: "free",
          subscription_status: "active",
          monthly_generations: 0,
          usage_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("subscription_tier, monthly_generations")
        .single();

      if (createError || !newProfile) {
        console.error("Failed to create profile:", createError);
        return res.status(500).json({ error: "Failed to create user profile" });
      }

      profile = newProfile;
    }

    // Check usage limits
    const limits: Record<string, number> = {
      free: 3,
      starter: 30,
      pro: 999999,
      agency: 999999,
    };

    const limit = limits[profile.subscription_tier] || 3;
    if (profile.monthly_generations >= limit) {
      return res.status(403).json({ error: "Usage limit reached" });
    }

    // Fetch URL content if needed
    let inputTitle = title;
    let inputContent = content;

    if (inputMode === "url") {
      // In production, use a proper web scraping service
      // For now, return mock data
      inputTitle = "Sample Blog Post Title";
      inputContent = "Sample blog post content would be extracted here...";
    }

    // Build AI prompt
    const systemPrompt = `You are ContentForge AI, an expert at repurposing blog content into platform-specific social media posts.

Your task: Generate 7 platform-optimized posts from the given blog content.

PLATFORM RULES:

1. TWITTER THREAD (3-5 tweets, each under 280 chars):
- Tweet 1 = hook (question/bold claim/stat)
- Last tweet = CTA + "Follow for more"
- Max 2 hashtags on last tweet only
- Use line breaks for readability

2. LINKEDIN POST (1,300 chars optimal):
- First 210 chars = hook (shows before "see more")
- Single-line paragraphs with empty lines
- End with engagement question
- 3-5 hashtags at end

3. LINKEDIN CAROUSEL (8-12 slides):
- Slide 1 = Cover title + "Swipe →"
- Slide 2 = Problem/question
- Each slide: headline (max 6 words) + body (max 25 words)
- Last slide = CTA + "Follow for more"

4. INSTAGRAM CAPTION (300-500 chars before fold):
- Storytelling/conversational tone
- 2-4 contextual emojis
- 20-30 hashtags in separate block at end
- End with question or "Save this"

5. FACEBOOK POST (400-600 chars):
- Conversational, like talking to friend
- Include engagement question
- 1-2 emojis max
- NO hashtags

6. NEWSLETTER:
- Subject line: max 50 chars, curiosity-driven
- Preview text: max 90 chars
- 3 key takeaways as bullets
- Brief intro (2-3 sentences)
- CTA: "Read the full post →"

7. YOUTUBE SHORTS SCRIPT (45-60 seconds spoken):
- HOOK (0-5 sec): Grab attention, no greetings
- BODY (5-45 sec): Main insight, simple language
- CTA (45-60 sec): Subscribe + comment prompt
- Include visual cues

For EACH platform, also provide:
- content_score (1-10): predicted engagement score
- score_reason: one sentence explaining the score

Return a JSON array of 7 objects with this exact structure:
[
  {
    "platform": "twitter",
    "format": "thread",
    "content": "Full content here",
    "tweets": ["Tweet 1", "Tweet 2", "Tweet 3"],
    "char_count": 840,
    "hashtags": ["#tag1", "#tag2"],
    "content_score": 7,
    "score_reason": "Strong hook with data point"
  },
  {
    "platform": "linkedin",
    "format": "post",
    "content": "Full post text...",
    "char_count": 1200,
    "hashtags": ["#tag1", "#tag2"],
    "content_score": 8,
    "score_reason": "Pattern interrupt opening"
  },
  {
    "platform": "linkedin_carousel",
    "format": "carousel",
    "slides": [
      {"slide_number": 1, "headline": "5 Productivity Hacks", "body": "That saved me 10 hours/week → Swipe"},
      {"slide_number": 2, "headline": "The Problem", "body": "We waste 40% of our workday"}
    ],
    "content_score": 9,
    "score_reason": "Carousels get 3x more reach"
  },
  {
    "platform": "instagram",
    "format": "caption",
    "content": "Caption text...",
    "char_count": 400,
    "hashtags": ["#tag1", "#tag2", ...],
    "content_score": 6,
    "score_reason": "Good storytelling"
  },
  {
    "platform": "facebook",
    "format": "post",
    "content": "Post text...",
    "char_count": 500,
    "content_score": 7,
    "score_reason": "Conversational tone"
  },
  {
    "platform": "newsletter",
    "format": "email",
    "subject_line": "Subject here",
    "preview_text": "Preview here",
    "content": "Body with takeaways",
    "content_score": 8,
    "score_reason": "Curiosity-driven subject"
  },
  {
    "platform": "youtube_shorts",
    "format": "script",
    "hook": "Opening line",
    "body": "Main content",
    "cta": "Call to action",
    "content_score": 7,
    "score_reason": "Strong hook"
  }
]`;

    const userPrompt = `Blog Post Title: ${inputTitle}

Blog Post Content:
${inputContent}

Generate all 7 platform-specific posts from this content. Return only the JSON array, no other text.`;

    // Call Anthropic Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `${systemPrompt}\n\n${userPrompt}`,
        },
      ],
    });

    const aiResponse = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Parse JSON response
    let outputs = [];
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        outputs = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    // Save generation to database
    const { data: generation, error: saveError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        voice_id: voiceId || null,
        input_type: inputMode,
        input_url: url || null,
        input_title: inputTitle,
        input_content: inputContent,
        input_word_count: inputContent.split(/\s+/).length,
        outputs: outputs,
        tokens_used: response.usage.input_tokens + response.usage.output_tokens,
        is_evergreen: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
    }

    // Increment usage counter
    await supabase
      .from("profiles")
      .update({ monthly_generations: profile.monthly_generations + 1 })
      .eq("id", user.id);

    return res.status(200).json({
      outputs,
      generationId: generation?.id || "",
    });
  } catch (error: any) {
    console.error("Generate error:", error);
    return res.status(500).json({ error: error.message || "Generation failed" });
  }
}