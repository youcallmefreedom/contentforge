---
title: Dashboard & App Layout
status: todo
priority: high
type: feature
tags: [dashboard, navigation, layout]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 4
---

## Notes
Protected app layout with sidebar navigation. Dashboard shows greeting, usage stats, recent generations, quick action cards. Sidebar 260px, collapsible on mobile, with user profile at bottom.

## Checklist
- [ ] Create AppLayout component: sidebar + main content area, responsive collapse
- [ ] Create Sidebar component: ContentForge logo, navigation links (Dashboard, Generate, Calendar, Library, Brand Voices, RSS Feeds, Settings), user avatar + name + plan badge, sign out button
- [ ] Create /dashboard page: greeting with user's name, stats cards (generations this month, saved posts, active voices, calendar items), recent generations list (last 5), quick action buttons (New Generation, View Calendar, Train Voice)
- [ ] Create StatsCard component: icon, number, label, trend indicator
- [ ] Create RecentGenerationItem component: title, date, platform badges, view button
- [ ] Create API route /api/dashboard-stats: fetch user's usage data