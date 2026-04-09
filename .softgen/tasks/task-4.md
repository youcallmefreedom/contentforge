---
title: Dashboard & App Layout
status: done
priority: high
type: feature
tags: [dashboard, layout, sidebar]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 4
---

## Notes
Protected app pages with sidebar navigation. Dashboard shows overview stats, usage meter, recent generations, and quick action cards.

## Checklist
- [x] Create AppLayout component: sidebar with logo, nav links (Dashboard, Generate, Calendar, Library, Voices, Feeds, Settings), user avatar + plan badge, sign out button
- [x] Create /dashboard page: greeting with user's first name, 3 stats cards (total generations, avg score, this month), usage meter with progress bar, 3 quick action cards (New Repurpose → /generate, Content Calendar → /calendar, Saved Library → /library), recent generations list with platform badges, view button
- [x] Create API route /api/dashboard-stats: fetch user's usage data