---
title: Content Calendar
status: done
priority: medium
type: feature
tags: [calendar, scheduling]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 5
---

## Notes
7-day week view with posts as colored cards. Users can view full content, change status, export CSV. "Plan This Week" button from Generate page auto-schedules posts based on platform best practices.

## Checklist
- [x] Create /calendar page: 7-column week view (Mon-Sun), week navigation arrows, "This Week" indicator
- [x] Create calendar card component: platform-colored left border (Twitter sky blue, LinkedIn dark blue, Instagram gradient, Facebook blue, Newsletter purple, YouTube red), shows platform badge + time + first 50 chars + status badge (Planned/Published/Skipped)
- [x] Add click card → modal: shows full content, copy button, status dropdown
- [x] Add "Export CSV" button: downloads calendar as CSV for Buffer/Hootsuite
- [x] Create API route /api/calendar/plan-week: accepts generationId + outputs array, assigns each post to a day/time based on platform rules (Twitter Mon/Wed/Fri 8-9AM, LinkedIn Tue/Thu 7-8AM or 5-6PM, Instagram Wed/Sat 11AM-1PM or 7-9PM, Facebook Mon/Thu 1-4PM, Newsletter Tue/Thu 10AM, YouTube any day 12-3PM, max 2 posts/day)