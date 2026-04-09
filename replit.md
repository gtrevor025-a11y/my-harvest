# Harvest - Agricultural Platform

## Overview
Harvest is a mobile-first React web application for agricultural communities. It connects farmers, provides farm management tools, a marketplace, community features, and an AI farm assistant.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui (Radix UI)
- **Routing**: React Router v6
- **State/Data**: TanStack React Query
- **Auth/DB**: Supabase (PostgreSQL + Auth + Google OAuth)
- **Forms**: React Hook Form + Zod

## Project Structure
```
src/
  App.tsx              # Root component, routes
  main.tsx             # Entry point
  pages/               # Full page components (Index, Login, Signup, etc.)
  components/          # Reusable UI components
    ui/                # shadcn/ui base components
    farm/              # Farm-specific components
    community/         # Community components
    home/              # Home page components
    onboarding/        # Onboarding flow components
  contexts/
    AuthContext.tsx    # Auth state — handles Supabase sessions (email/password + Google OAuth)
  services/
    supabaseClient.ts  # Supabase client + signInWithGoogle() helper
    profileService.ts  # User profile sync
    socialService.ts   # Supabase social data layer (posts, reactions, comments, communities, media)
    farmService.ts     # Supabase farm data layer (records, activities, tasks, notifications, AI requests)
    aiService.ts       # AI farm assistant with fallback knowledge base
    newsService.ts     # Location-aware agri news (4-tier: county->national->regional->global)
    marketplaceService.ts  # Marketplace listings (currently localStorage-backed)
  lib/
    dataService.ts     # localStorage CRUD used by some features
    agricultureKnowledge.ts  # AI knowledge base fallback
    adminConfig.ts     # Admin role checking
    utils.ts
  hooks/               # Custom React hooks
supabase/              # SQL schema files (run in Supabase SQL editor)
  social_schema.sql
  farm_schema.sql
  extended_schema.sql
```

## Supabase Tables
- `profiles` — User metadata
- `posts`, `post_reactions`, `post_comments` — Social feed
- `communities`, `community_members` — Social groups
- `farm_records`, `farm_activities`, `farm_tasks`, `farm_notifications` — Farm management
- `ai_requests` — AI assistant interaction log

## Environment Variables (set as shared env vars in Replit)
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key (full JWT)
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID
- `VITE_APP_URL` — App URL (update after deploying)

## Running the App
- Development: `npm run dev` (serves on port 8080, mapped to external port 80)
- Build: `npm run build`

## Key Notes
- Pure frontend SPA — no custom Node.js server. Supabase is the backend.
- Migrated from Lovable/Vercel to Replit. Vite configured with `host: "0.0.0.0"`, `allowedHosts: true`.
- Google OAuth redirect must include the Replit dev domain in Supabase's allowed redirect URLs.
- The `.env` file stores Supabase credentials for local dev; shared env vars are the authoritative source in Replit.
