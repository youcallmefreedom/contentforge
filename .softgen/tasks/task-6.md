---
title: Content Library
status: done
priority: medium
type: feature
tags: [library, saved]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 6
---

## Notes
Saved posts appear in a grid with platform badges and tags. Users can search by content or tags, filter by platform, view full content in modal, copy or delete.

## Checklist
- [x] Create /library page: grid of saved posts cards
- [x] Add search bar: filters by content text or tags
- [x] Add platform filter dropdown: show all or specific platform
- [x] Create post card component: platform badge, first 100 chars, tags (max 3 visible), evergreen badge, created date
- [x] Add click card → modal: full content, copy button, delete button
- [x] Create API route /api/library/save: add post to saved_posts table
- [x] Create API route /api/library/delete: remove saved post
- [x] Add tag input for organizing posts