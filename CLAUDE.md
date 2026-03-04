# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint check
```

No test suite is configured. Scripts in `/scripts/` (reset-and-seed, promote-admin, etc.) can be run directly with `npx ts-node scripts/<name>.ts`.

## Architecture Overview

**Next.js 15 App Router** with two main zones:
- `app/(authenticated)/` — Protected UI pages (home, matches, directory, messages, events, projects, profile) behind Clerk middleware + MongoDB approval check
- `app/api/` — REST API endpoints consumed by both the UI and OpenClaw agents

**Auth Flow (two layers):**
1. **Clerk** handles identity (OAuth/email). Middleware at `middleware.ts` protects all routes except `/, /login, /sign-in, /sign-up, /apply, /claim, /api/*`.
2. **MongoDB User record** tracks application approval status. `requireAuth()` in `lib/utils/auth.ts` validates both Clerk session AND `user.status === 'approved'`. Email domain is restricted to `@mit.edu`, `@harvard.edu`, and Harvard subdomains.

**Agent Auth:** OpenClaw agents authenticate via `Authorization: Bearer <api-key>` header. `requireAuthOrAgent()` accepts either a human session or a valid agent API key. Agents must be claimed by an approved human user before accessing the platform.

**Database:** MongoDB Atlas via Mongoose. Connection is cached in `lib/db/mongodb.ts`. Models live in `lib/models/` — key ones: `User`, `Application`, `Match`, `Conversation`, `Message`, `Event`, `Project`, `CoffeeChat`, `Agent`.

**Matching Algorithm** (`lib/utils/matching.ts`): Runs weekly via Vercel cron (`vercel.json` → `/api/cron/weekly-matches`, Mondays 14:14 UTC). Scores pairs on skill complementarity (35%), interest alignment (25%), school diversity (15%), stage alignment (15%). Generates max 2 matches per user per week, avoiding repeat pairings.

**Email:** Resend API via `lib/utils/email.ts`. Sent for application approvals and weekly match digests. Branded as "William x John".

## Environment Variables

```
MONGODB_URI             # MongoDB Atlas connection string
MONGODB_DB              # Database name (e.g. cofounder-matching)
APP_URL                 # Server-side base URL
NEXT_PUBLIC_APP_URL     # Client-side base URL
JWT_SECRET              # JWT signing secret
ADMIN_KEY               # Secret for admin-only endpoints
RESEND_API_KEY          # Resend email API key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
TEST_EMAILS             # Comma-separated emails bypassing MIT/Harvard domain check
ADMIN_EMAILS            # Comma-separated emails that auto-promote to admin on signup
FROM_EMAIL              # Email sender (defaults to "William x John <onboarding@resend.dev>")
```

## Key Patterns

- API helpers (`lib/utils/api-helpers.ts`) provide typed `successResponse()` / `errorResponse()` wrappers — use these in all API routes.
- Admin endpoints check `user.role === 'admin'` via `requireAuth()` return value.
- The `app/skill.md`, `app/skill.json`, and `app/heartbeat.md` files are OpenClaw package metadata served as static routes for agent discovery — treat them as public API documentation.
- Tailwind CSS v4 is configured via PostCSS (`postcss.config.mjs`), not a `tailwind.config.js`. Global styles are in `app/globals.css`.
- Path alias `@/*` maps to the repo root (set in `tsconfig.json`).
