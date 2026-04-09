---
title: Brand Voice Training
status: done
priority: medium
type: feature
tags: [ai, voices]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 7
---

## Notes
Users paste 3-10 sample posts, AI analyzes writing style (tone, vocab, emoji usage, humor), creates system prompt. Free users see upgrade prompt. Starter gets 1 voice, Pro gets 3, Agency gets 10.

## Checklist
- [x] Create /voices page: grid of voice cards with attributes (tone, emoji usage, humor), default badge, create button
- [x] Create /voices/[id] page: name + description inputs, sample post text areas with platform selectors, "Analyze My Voice" button, voice profile display (tone scale, vocabulary, emoji, humor, sentence length, signature phrases)
- [x] Create API route /api/voices/analyze: calls Claude API to extract voice characteristics from samples, returns JSON with tone (1-10), vocabulary_level, emoji_usage, humor_level, avg_sentence_length, signature_phrases
- [x] Create API route /api/voices/save: saves voice to brand_voices table with compiled system_prompt
- [x] Create API route /api/voices/list: fetch user's voices
- [x] Create API route /api/voices/delete: remove voice