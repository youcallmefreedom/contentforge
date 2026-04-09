---
title: Content Library
status: todo
priority: medium
type: feature
tags: [library, saved, search]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 6
---

## Notes
Grid view of all saved posts. Filter by platform, search by content, tag organization. Each card shows platform badge, preview, copy button. Evergreen toggle for posts worth recycling.

## Checklist
- [ ] Create /library page: search bar, platform filter dropdown, evergreen toggle, sort options (newest, oldest, most saved)
- [ ] Create LibraryGrid component: responsive grid of saved post cards
- [ ] Create LibraryCard component: platform badge, content preview (100 chars), tags, copy button, delete button, evergreen star icon
- [ ] Create API route /api/library/posts: fetch saved posts with filters
- [ ] Create API route /api/library/save: save post from generation
- [ ] Create API route /api/library/delete: remove saved post
- [ ] Add tag input for organizing posts