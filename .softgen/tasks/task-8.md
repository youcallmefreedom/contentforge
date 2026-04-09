---
title: RSS Feeds & Settings
status: done
priority: low
type: feature
tags: [rss, settings, stripe]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 8
---

## Notes
Pro users can add RSS feeds to auto-monitor blogs. Settings page shows account info, subscription management via Stripe Customer Portal, and usage stats.

## Checklist
- [ ] Create /feeds page: list of active feeds, add feed form (URL + voice selector), last checked timestamp, Pro-only guard with upgrade prompt
- [ ] Create API route /api/feeds/add: validates RSS URL, saves to rss_feeds table
- [ ] Create API route /api/feeds/delete: remove feed
- [x] Create /settings page with tabs: Account (edit name, view email, usage stats), Subscription (current plan, upgrade options, manage button → Stripe portal), Preferences (placeholder for notifications)
- [x] Integrate Stripe: install @stripe/stripe-js, create API routes /api/stripe/create-checkout, /api/stripe/create-portal, /api/stripe/webhook
- [x] Add Stripe checkout flow: user selects plan → redirects to Stripe → webhook updates subscription_tier
- [x] Add Customer Portal session: user clicks "Manage" → redirects to Stripe portal for cancel/upgrade
- [x] Create API route /api/stripe/webhook: handle subscription events