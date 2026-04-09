---
title: RSS Feeds & Settings
status: todo
priority: low
type: feature
tags: [rss, settings, subscription]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 8
---

## Notes
RSS feed management (Pro plan only). Add feed URL, auto-monitor for new posts. Settings page for account info, subscription management (Stripe portal), preferences.

## Checklist
- [ ] Create /feeds page: list of RSS feeds with site name, last checked, active toggle, delete button, "Add Feed" form (Pro plan gate)
- [ ] Create API route /api/feeds/add: validate RSS URL, save to database
- [ ] Create API route /api/feeds/check: cron job checks feeds for new posts, auto-generates content
- [ ] Create /settings page: tabs for Account, Subscription, Preferences
- [ ] Account tab: display name, email, password change form
- [ ] Subscription tab: current plan badge, usage stats, "Manage Subscription" button (opens Stripe portal), upgrade/downgrade cards
- [ ] Preferences tab: default brand voice selector, notification preferences, timezone
- [ ] Create API route /api/stripe/create-checkout: Stripe Checkout session for upgrades
- [ ] Create API route /api/stripe/portal: Stripe Customer Portal session
- [ ] Create API route /api/stripe/webhook: handle subscription events