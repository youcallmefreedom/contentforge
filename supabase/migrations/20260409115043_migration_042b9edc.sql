-- Create profiles table with subscription tracking
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'agency')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  monthly_generations INTEGER NOT NULL DEFAULT 0,
  usage_reset_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create brand_voices table
CREATE TABLE IF NOT EXISTS brand_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sample_posts JSONB NOT NULL DEFAULT '[]',
  voice_attributes JSONB NOT NULL DEFAULT '{}',
  system_prompt TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voice_id UUID REFERENCES brand_voices(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('url', 'text')),
  input_url TEXT,
  input_title TEXT NOT NULL,
  input_content TEXT NOT NULL,
  input_word_count INTEGER NOT NULL,
  outputs JSONB NOT NULL DEFAULT '[]',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  is_evergreen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create calendar_items table
CREATE TABLE IF NOT EXISTS calendar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  format TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'published', 'skipped')),
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_evergreen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create rss_feeds table
CREATE TABLE IF NOT EXISTS rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voice_id UUID REFERENCES brand_voices(id) ON DELETE SET NULL,
  feed_url TEXT NOT NULL,
  site_name TEXT NOT NULL,
  last_checked_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_feeds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (T1 - private user data)
CREATE POLICY "select_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for brand_voices (T1 - private user data)
CREATE POLICY "select_own_voices" ON brand_voices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_voices" ON brand_voices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_voices" ON brand_voices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_voices" ON brand_voices FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for generations (T1 - private user data)
CREATE POLICY "select_own_generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_generations" ON generations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_generations" ON generations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for calendar_items (T1 - private user data)
CREATE POLICY "select_own_calendar" ON calendar_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_calendar" ON calendar_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_calendar" ON calendar_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_calendar" ON calendar_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_posts (T1 - private user data)
CREATE POLICY "select_own_saved" ON saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_saved" ON saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_saved" ON saved_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_saved" ON saved_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rss_feeds (T1 - private user data)
CREATE POLICY "select_own_feeds" ON rss_feeds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_feeds" ON rss_feeds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_feeds" ON rss_feeds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_feeds" ON rss_feeds FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();