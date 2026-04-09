---
title: Generate Page - Main Content Tool
status: todo
priority: high
type: feature
tags: [core, ai, generation]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 3
---

## Notes
THE core feature. Two-panel layout: left for input (URL/text toggle, brand voice selector, usage meter), right for tabbed outputs (7 platform tabs). Each output shows content, character count, engagement score, copy/save/regenerate buttons. After generation, prominent "Plan This Week" button creates calendar.

## Checklist
- [ ] Create /generate page layout: two-column responsive grid
- [ ] Create InputPanel component: URL/text toggle, fetch button, title + textarea, brand voice dropdown, usage meter with progress bar
- [ ] Create OutputTabs component: 7 tabs with platform icons (Twitter, LinkedIn, LinkedIn Carousel, Instagram, Facebook, Newsletter, YouTube)
- [ ] Create OutputCard component: formatted content display, character count badge (green/red), content score badge (1-10 with color), copy/save/regenerate buttons
- [ ] Create TwitterThreadView: connected tweet bubbles with numbering (1/5, 2/5)
- [ ] Create LinkedInCarouselView: slide cards with slide numbers, headlines (max 6 words), body text (max 25 words)
- [ ] Create YouTubeShortsView: script with [HOOK], [BODY], [CTA] sections and visual cues
- [ ] Create NewsletterView: subject line, preview text, body sections
- [ ] Create API route /api/generate: fetch URL content, check usage limits, call Claude API, save generation
- [ ] Create API route /api/regenerate-platform: regenerate single platform output
- [ ] Add loading skeletons during AI generation
- [ ] Add "Plan This Week" button that creates calendar items