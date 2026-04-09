---
title: Authentication System
status: todo
priority: urgent
type: feature
tags: [auth, supabase, security]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 2
---

## Notes
Supabase Auth with email/password. Protected routes redirect to login. After signup, create profile in database. Session management with cookies.

## Checklist
- [ ] Set up Supabase client configuration in lib/supabase.ts
- [ ] Create /login page: email + password form, "Forgot password?" link, "Sign up" link
- [ ] Create /signup page: full name + email + password form, validation, "Already have account?" link
- [ ] Create /forgot-password page: email input, reset link flow
- [ ] Create AuthContext in contexts/AuthContext.tsx: useAuth hook, loading states, user session
- [ ] Create ProtectedRoute component: redirects to /login if not authenticated
- [ ] Create API route /api/auth/signup: creates auth user + profile record
- [ ] Update _app.tsx: wrap with AuthContext provider