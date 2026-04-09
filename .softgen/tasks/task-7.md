---
title: Brand Voice Training
status: todo
priority: medium
type: feature
tags: [ai, voice, training]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 7
---

## Notes
Users paste 3-10 sample posts. AI analyzes tone, vocabulary, emoji usage, hashtag style, CTA patterns, sentence length. Creates voice profile + system prompt. List page shows all voices, create/edit pages for training.

## Checklist
- [ ] Create /voices page: list of brand voices with name, description, "Default" badge, edit/delete buttons, "Create New Voice" button
- [ ] Create /voices/new page: name input, description textarea, "Add Sample Post" button (creates new textarea + platform selector), "Analyze My Voice" button
- [ ] Create /voices/[id] page: edit existing voice, show voice profile analysis card
- [ ] Create VoiceProfileCard component: visual display of tone scale, vocabulary level, emoji usage, hashtag style, CTA patterns, signature phrases
- [ ] Create API route /api/voices/analyze: calls Claude to analyze sample posts, extract voice attributes, compile system prompt
- [ ] Create API route /api/voices/create: saves voice to database
- [ ] Create API route /api/voices/list: fetch user's voices
- [ ] Create API route /api/voices/delete: remove voice