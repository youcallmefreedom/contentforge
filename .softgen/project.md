# ContentForge — AI Content Repurposing SaaS

## Vision
ContentForge transforms one blog post into a full week of platform-optimized social media content. Users paste a URL or text, select their brand voice, and receive 7 ready-to-publish posts (Twitter threads, LinkedIn posts/carousels, Instagram captions, Facebook posts, newsletters, YouTube Shorts scripts) with AI-powered engagement predictions. Target users: content creators, marketers, agencies managing multiple clients.

## Design
Primary: 172 68% 47% (deep teal — trust, growth)
Accent: 45 60% 45% (warm gold — urgency, CTAs)
Background: 0 0% 100% (white)
Foreground: 222 47% 11% (near-black)
Muted: 210 40% 96% (light gray backgrounds)
Border: 214 32% 91% (subtle borders)

Headings: Plus Jakarta Sans (600, 700)
Body: Work Sans (400, 500)

Style: Linear's precision + Notion's approachability — clean, data-focused, professional without coldness. Generous whitespace, subtle card elevation, platform badges use authentic brand colors.

## Features
- Landing page with hero, how-it-works, platform showcase, pricing, FAQ
- Auth system (signup/login/password reset) with Supabase
- Dashboard with stats, recent generations, quick actions
- Generate page (main tool) — paste URL/text → AI generates 7 platform posts with engagement scores
- Content calendar — week view with auto-scheduling based on platform best practices
- Library — saved posts with search/filter
- Brand Voices — train AI on user's writing style
- RSS Feeds — auto-monitor blogs (Pro plan)
- Settings — account, subscription (Stripe), preferences
- Subscription tiers: Free (3/mo), Starter ($15, 30/mo), Pro ($29, unlimited), Agency ($79, team features)