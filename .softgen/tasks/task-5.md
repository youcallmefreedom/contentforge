---
title: Content Calendar
status: todo
priority: medium
type: feature
tags: [calendar, scheduling, planning]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 5
---

## Notes
Week view calendar (7 columns Mon-Sun). Posts appear as colored cards by platform. Click card opens modal with full content. Status toggles, CSV export. Auto-scheduling based on platform best practices.

## Checklist
- [ ] Create /calendar page: week view header with date range, navigation arrows (This Week / Next Week)
- [ ] Create CalendarGrid component: 7 day columns, responsive stacking on mobile
- [ ] Create CalendarCard component: platform icon + color, first 50 chars preview, time, status badge
- [ ] Create PostModal component: full content display, copy button, status dropdown (Planned/Published/Skipped), platform metadata
- [ ] Create API route /api/calendar/create-week: auto-schedule posts based on platform best practices
- [ ] Create API route /api/calendar/items: fetch calendar items for date range
- [ ] Add "Export CSV" button: generates Buffer/Hootsuite compatible CSV
- [ ] Platform scheduling logic: Twitter Mon/Wed/Fri 8-9AM, LinkedIn Tue/Thu 7-8AM, Instagram Wed/Sat 11AM-1PM, Facebook Mon/Thu 1-4PM, Newsletter Tue/Thu 10AM, YouTube any day 12-3PM, max 2 posts/day