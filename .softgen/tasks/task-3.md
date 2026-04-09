---
title: Generate Page - Main Content Tool
status: in_progress
priority: high
type: feature
tags: [generate, ai, anthropic]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 3
---

## Notes
The core feature — paste URL or text, select voice, AI generates 7 platform posts with engagement scores. This is where the magic happens. Must feel fast and satisfying.

## Checklist
- [x] Create /generate page: two-panel layout (input left, output right on desktop)
- [x] Add input mode toggle: URL vs Text with icons
- [x] Add URL mode: input field + "Fetch & Repurpose" button
- [x] Add Text mode: title input + large textarea + "Repurpose" button
- [x] Add Brand Voice dropdown selector (shows user's voices + "Default")
- [x] Add usage meter: shows monthly usage with progress bar, upgrade prompt if over limit
- [x] Create output tabs component: 7 tabs (Twitter, LinkedIn Post, LinkedIn Carousel, Instagram, Facebook, Newsletter, YouTube Shorts) with platform icons
- [x] Create API route /api/generate: validates usage limits, calls Anthropic Claude API with structured prompt, parses JSON response, saves to generations table, increments monthly_generations
- [ ] Add output rendering: Twitter shows threaded tweets, Carousel shows slide cards, Newsletter shows subject/preview/body, YouTube shows hook/body/cta with colored labels
- [ ] Add content score badges: 1-3 red "Low", 4-6 yellow "Average", 7-8 green "Good", 9-10 gold "Viral Potential"
- [ ] Add action buttons per tab: Copy (clipboard), Save (to library), Regenerate (single platform)
- [ ] Add loading skeletons during AI generation
- [ ] Add "Plan This Week" button that creates calendar items