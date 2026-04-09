import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_tier: "free" | "starter" | "pro" | "agency";
  subscription_status: "active" | "canceled" | "past_due" | null;
  monthly_generations: number;
  usage_reset_date: string;
  created_at: string;
};

export type BrandVoice = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  sample_posts: Array<{ platform: string; content: string }>;
  voice_attributes: {
    tone: number;
    vocabulary: string;
    sentence_length: number;
    emoji_usage: string;
    hashtag_style: string;
    cta_patterns: string;
    humor_level: string;
    signature_phrases: string[];
  };
  system_prompt: string;
  is_default: boolean;
  created_at: string;
};

export type Generation = {
  id: string;
  user_id: string;
  voice_id: string | null;
  input_type: "url" | "text";
  input_url: string | null;
  input_title: string;
  input_content: string;
  input_word_count: number;
  outputs: Array<{
    platform: string;
    format: string;
    content: string;
    char_count: number;
    hashtags?: string[];
    tweets?: string[];
    slides?: Array<{ slide_number: number; headline: string; body: string }>;
    subject_line?: string;
    preview_text?: string;
    hook?: string;
    body?: string;
    cta?: string;
    duration_estimate?: string;
    visual_cues?: string[];
    content_score: number;
    score_reason: string;
  }>;
  tokens_used: number;
  is_evergreen: boolean;
  created_at: string;
};