---
title: Authentication System
status: done
priority: urgent
type: feature
tags: [auth, supabase]
created_by: agent
created_at: 2026-04-09T11:43:29Z
position: 2
---

## Notes
Full authentication flow with Supabase Auth. Email/password signup creates both auth user and profile record. Protected routes redirect to login.

## Checklist
- [x] Install @supabase/supabase-js
- [x] Create lib/supabase.ts: Supabase client + TypeScript types for profiles, brand_voices, generations
- [x] Create AuthContext: manages user state, profile fetching, auth methods
- [x] Create /login page: email + password form, "Forgot password?" link
- [x] Create /signup page: full name + email + password form
- [x] Create /forgot-password page: email input, sends reset link
- [x] Create auth methods: signIn redirects to /dashboard, signUp creates auth user + profile record
- [x] Update _app.tsx: wrap with AuthContext provider