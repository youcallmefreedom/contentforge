import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { samplePosts } = req.body;

    const prompt = `Analyze these social media posts and extract the writer's voice characteristics. Return ONLY valid JSON with no markdown formatting.

Sample Posts:
${samplePosts.map((p: any, i: number) => `${i + 1}. [${p.platform}] ${p.content}`).join("\n\n")}

Analyze and return this exact JSON structure:
{
  "tone": <number 1-10, where 1=very formal, 10=very casual>,
  "vocabulary_level": "<simple|standard|sophisticated>",
  "emoji_usage": "<none|light|moderate|heavy>",
  "humor_level": "<serious|witty|playful>",
  "avg_sentence_length": "<short|medium|long>",
  "signature_phrases": ["phrase1", "phrase2"]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const attributes = JSON.parse(jsonMatch[0]);

    return res.status(200).json({ attributes });
  } catch (error: any) {
    console.error("Voice analysis error:", error);
    return res.status(500).json({ error: error.message || "Analysis failed" });
  }
}