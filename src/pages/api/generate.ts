import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Create a server-side Supabase client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// Create a client-side Supabase client for auth verification
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function callAnthropicAPI(systemPrompt: string, userPrompt: string): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  let lastError: any = null;

  // Retry up to 3 times for 529 errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      });

      if (response.status === 529) {
        console.log(`Anthropic API overloaded (529), attempt ${attempt}/3`);
        lastError = new Error("Anthropic API overloaded");
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        throw lastError;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Anthropic API error ${response.status}:`, errorText);
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      lastError = error;
      if (attempt < 3 && error.message?.includes("overloaded")) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

async function fetchUrlContent(url: string): Promise<{ title: string; content: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ContentForge/1.0)",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = stripHtml(titleMatch?.[1] || h1Match?.[1] || "Untitled");

    // Extract main content
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    
    const rawContent = articleMatch?.[1] || mainMatch?.[1] || bodyMatch?.[1] || html;
    const content = stripHtml(rawContent);

    // Truncate to ~5000 words max
    const words = content.split(/\s+/).slice(0, 5000).join(" ");

    return { title, content: words };
  } catch (error: any) {
    console.error("URL fetch error:", error.message);
    throw new Error(`Could not fetch content from URL: ${error.message}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ALWAYS return JSON - wrap everything in try-catch
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { inputMode, url, title, content, voiceId } = req.body;

    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized - no auth header" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }

    // Get or create profile using admin client (bypasses RLS)
    let { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("subscription_tier, monthly_generations")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || "",
          subscription_tier: "free",
          subscription_status: "active",
          monthly_generations: 0,
          usage_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("subscription_tier, monthly_generations")
        .single();

      if (createError || !newProfile) {
        return res.status(500).json({ error: "Failed to create user profile" });
      }
      profile = newProfile;
    }

    // Check usage limits
    const limits: Record<string, number> = { free: 3, starter: 30, pro: 999999, agency: 999999 };
    const limit = limits[profile.subscription_tier] || 3;
    
    if (profile.monthly_generations >= limit) {
      return res.status(403).json({ error: "Monthly usage limit reached. Please upgrade your plan." });
    }

    // Get content
    let inputTitle = title || "";
    let inputContent = content || "";

    if (inputMode === "url") {
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      const fetched = await fetchUrlContent(url);
      inputTitle = fetched.title;
      inputContent = fetched.content;
    } else {
      inputTitle = stripHtml(inputTitle);
      inputContent = stripHtml(inputContent);
    }

    if (!inputContent || inputContent.length < 50) {
      return res.status(400).json({ error: "Content must be at least 50 characters long" });
    }

    // Build prompts
    const systemPrompt = `You are ContentForge AI, an expert content repurposer. Generate 7 platform-optimized social media posts from blog content.

IMPORTANT: Return ONLY a valid JSON array. No markdown, no code fences, no explanation text. Just the raw JSON array.

Platform rules:
1. TWITTER THREAD: 3-5 tweets, each under 280 chars. Tweet 1=hook. Last tweet=CTA. Max 2 hashtags on last tweet.
2. LINKEDIN POST: ~1300 chars. First 210 chars=hook. Single-line paragraphs. End with question. 3-5 hashtags at end.
3. LINKEDIN CAROUSEL: 8-12 slides. Slide 1=cover+"Swipe". Each slide: headline (max 6 words) + body (max 25 words). Last=CTA.
4. INSTAGRAM CAPTION: 300-500 chars. Storytelling tone. 2-4 emojis. 20-30 hashtags in separate block. End with question.
5. FACEBOOK POST: 400-600 chars. Conversational. Include question. 1-2 emojis. NO hashtags.
6. NEWSLETTER: Subject line (max 50 chars). Preview text (max 90 chars). 3 takeaway bullets. Brief intro. CTA.
7. YOUTUBE SHORTS SCRIPT: 45-60 sec spoken. HOOK (0-5s), BODY (5-45s), CTA (45-60s). No greetings. Visual cues.

For each output include content_score (1-10) and score_reason (one sentence).

Return this exact JSON structure:
[{"platform":"twitter","format":"thread","content":"...","tweets":["...","..."],"char_count":0,"hashtags":[],"content_score":7,"score_reason":"..."},{"platform":"linkedin","format":"post","content":"...","char_count":0,"hashtags":[],"content_score":7,"score_reason":"..."},{"platform":"linkedin_carousel","format":"carousel","slides":[{"slide_number":1,"headline":"...","body":"..."}],"content_score":7,"score_reason":"..."},{"platform":"instagram","format":"caption","content":"...","char_count":0,"hashtags":[],"content_score":7,"score_reason":"..."},{"platform":"facebook","format":"post","content":"...","char_count":0,"content_score":7,"score_reason":"..."},{"platform":"newsletter","format":"email","subject_line":"...","preview_text":"...","content":"...","content_score":7,"score_reason":"..."},{"platform":"youtube_shorts","format":"script","hook":"...","body":"...","cta":"...","content_score":7,"score_reason":"..."}]`;

    const userPrompt = `Blog Title: ${inputTitle}\n\nBlog Content:\n${inputContent.substring(0, 8000)}\n\nGenerate all 7 platform posts. Return ONLY the JSON array, nothing else.`;

    // Call Anthropic API using raw fetch (no SDK dependency)
    const apiResponse = await callAnthropicAPI(systemPrompt, userPrompt);

    const aiText = apiResponse.content?.[0]?.type === "text" 
      ? apiResponse.content[0].text 
      : "";

    if (!aiText) {
      return res.status(500).json({ error: "Empty response from AI" });
    }

    // Parse JSON from response
    let outputs = [];
    try {
      // Try to find JSON array in the response
      const cleaned = aiText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        outputs = JSON.parse(jsonMatch[0]);
      } else {
        // Try parsing the entire response as JSON
        outputs = JSON.parse(cleaned);
      }
    } catch (parseError: any) {
      console.error("JSON parse error:", parseError.message);
      console.error("AI response preview:", aiText.substring(0, 500));
      return res.status(500).json({ 
        error: "Failed to parse AI response. Please try again.",
        preview: aiText.substring(0, 200)
      });
    }

    if (!Array.isArray(outputs) || outputs.length === 0) {
      return res.status(500).json({ error: "AI returned invalid output format. Please try again." });
    }

    // Save generation to database using admin client
    const { data: generation, error: saveError } = await supabaseAdmin
      .from("generations")
      .insert({
        user_id: user.id,
        voice_id: voiceId || null,
        input_type: inputMode,
        input_url: url || null,
        input_title: inputTitle,
        input_content: inputContent.substring(0, 50000),
        input_word_count: inputContent.split(/\s+/).length,
        outputs: outputs,
        tokens_used: (apiResponse.usage?.input_tokens || 0) + (apiResponse.usage?.output_tokens || 0),
        is_evergreen: false,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Database save error:", saveError);
      // Don't fail the request - still return the outputs
    }

    // Increment usage counter
    await supabaseAdmin
      .from("profiles")
      .update({ monthly_generations: (profile.monthly_generations || 0) + 1 })
      .eq("id", user.id);

    // Return successful response
    return res.status(200).json({
      outputs,
      generationId: generation?.id || "",
    });

  } catch (error: any) {
    console.error("Generate API error:", error.message || error);
    
    // ALWAYS return JSON
    return res.status(500).json({
      error: error.message || "Generation failed. Please try again.",
    });
  }
}