# SponsorFlow: Project Process & Architecture Tracker

> **Live Document**: This file tracks the architecture, tech stack, build progression, active milestones, and implementation history for SponsorFlow. It is maintained and updated across each development phase.

---

## 1. 📌 Project Overview

**SponsorFlow** is a multi-user, AI-powered personal job acquisition platform designed to help tech professionals (focusing initially on UK sponsor-licensed companies) conduct high-converting, personalized cold outreach at scale while maintaining full human control over every email sent.

### Core Value Proposition
- **Multi-Tenant Isolation**: Complete isolation of user profiles, campaigns, contacts, emails, and metrics via PostgreSQL Row-Level Security (RLS).
- **Deep Personalization Engine**: Merges 10-step candidate profile positioning (e.g. Fintech, Healthcare, SaaS) with company/contact context via Claude AI.
- **Human-in-the-Loop Safety**: 100% review and approval required before emails enter the dispatch queue.
- **Safe Outbound Dispatch**: Direct Gmail OAuth integration with automatic rate-limiting (20 emails/day, 5/hour).
- **Closed-Loop Intelligence**: Webhook-based inbound reply tracking and AI intent classification (Positive, Interested, Rejection) with suggested action workflows.

---

## 2. 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) + React 18 | Full-stack server/client components, SEO, fast routing |
| **Language** | TypeScript (Strict Mode) | Type-safe models, database mapping, API schemas |
| **Styling & Design** | Tailwind CSS + Shopify-Inspired Design System | Cinematic dark hero + cream/mint transactional UI |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Relational storage, Row-Level Security (RLS), Auth |
| **AI Personalization** | Anthropic Claude API (`@anthropic-ai/sdk`) | Structured cold email drafting & reply sentiment parsing |
| **Email Transport** | Gmail API (Google OAuth 2.0) | Direct inbox sending and thread monitoring |
| **Webhooks & PubSub** | Google Cloud Pub/Sub + Webhooks | Real-time inbound email reply detection |
| **File Storage** | Supabase Storage / AWS S3 | CV, portfolio docs, and template storage |
| **Validation** | Zod + React Hook Form | Robust schema and client/server validation |
| **Deployment** | Vercel | Production hosting with edge caching and serverless routes |

---

## 3. 🎨 Design System Principles

- **Hero & Marketing Canvas**: `#000000` / `#0a0a0a` night canvas, thin display typography (Neue Haas Grotesk / Inter), white-stroked pill CTAs.
- **Application & Dashboard Canvas**: Cream-mint `#fbfbf5` canvas, pastel aloe (`#c1fbd4`) and pistachio (`#d4f9e0`) accents, dark slate text (`#000000` / `#1e2c31`), high-contrast pill buttons.
- **Micro-Interactions**: Smooth state transitions, hover states, clear validation and auto-save feedback.

---

## 4. 🗺️ Phase 1 Roadmap & Build Progress

```
[Prompt 1]  Database Schema & RLS Migrations          [Completed ✅]
[Prompt 2]  Next.js 14 Setup + Tailwind Design System [Completed ✅]
[Prompt 3]  Email/Password Auth + Session Guard       [Completed ✅]
[Prompt 4]  Google OAuth 2.0 Authentication           [Completed ✅]
[Prompt 5]  10-Step User Profile Onboarding           [Completed ✅]
[Prompt 6]  CSV Import & Smart Deduplication          [Completed ✅]
[Prompt 7]  Claude AI Email Generation Engine         [Completed ✅]
[Prompt 8]  Email Review, Edit & Approval Workflow    [Completed ✅]
[Prompt 9]  Gmail OAuth Integration                   [Completed ✅]
[Prompt 10] Email Dispatcher & Rate Limiter           [Completed ✅]
[Prompt 11] Gmail Pub/Sub Webhook & AI Classifier     [Completed ✅]
[Prompt 12] Outreach Pipeline & Analytics Dashboard   [Completed ✅]
```

---

## 5. 🏗️ Build Log & Milestones

### Milestone 13: Light Mode Theme Engine, Interactive Notifications & Full Settings Dashboard
- **Date**: 2026-09-09
- **Status**: Completed ✅
- **Details**:
  - Built comprehensive `ThemeProvider` supporting `dark`, `light` (Shopify cream-mint `#fbfbf5`), and `system` modes with zero-FOUC inline script.
  - Implemented `NotificationPopover.tsx` with animated unread badge counter, alert filtering, mark-as-read toggles, and direct deep-links.
  - Built full `SettingsPage` (`/dashboard/settings`) with 6 functional tabs: Profile Positioning, Gmail Safety Caps & Rates, Claude AI Model Configuration & Signature, Appearance & Themes, Integrations & Connection Health, and Data Export / Danger Zone.
  - Implemented `/api/settings` REST route with full validation and persistence.
  - Added Settings item with active state to `Sidebar.tsx` and protected `/settings` in `middleware.ts`.
  - Verified with `npx tsc --noEmit` (0 errors) and `npm run build` (55/55 routes compiled).

### Milestone 12: Outreach Pipeline & Visual Analytics Dashboard
- **Date**: 2026-09-09
- **Status**: Completed ✅
- **Details**:
  - Implemented multi-metric aggregation engine in `lib/db.ts`:
    - `getUserAnalytics()` — aggregates companies, outreach emails, and AI reply classifications.
    - Computes real-time KPIs: total companies targeted, emails sent, estimated open rate, response rate, positive sentiment leads, active interviews, and offers.
    - Builds 6-stage conversion funnel: Targeted → Contacted → Inbound Replies → Warm Leads → Interviews → Offers.
    - Generates target industry performance breakdown with reply rate percentages.
    - Assembles 14-day outbound vs inbound reply timeline activity buckets.
  - Built dynamic API route in `app/api/analytics/route.ts`:
    - Session-authenticated with `getCurrentUser()`.
    - Supports timeframe query parameter (`7d`, `14d`, `30d`, `all`).
    - Includes fallback simulation dataset for offline and unauthenticated preview.
  - Built comprehensive Analytics Dashboard in `app/(dashboard)/analytics/page.tsx`:
    - Executive KPI Ribbon (Targeted Sponsors, Outreach Sent, Open Rate %, Response Rate %, Pipeline Leads).
    - 6-Stage Pipeline Conversion Funnel with visual percentage drop-off and progress indicators.
    - Target Industry Performance comparison table with reply rate bars.
    - Claude AI Inbound Reply Sentiment Breakdown (Positive, Interested, Question, Out of Office, Rejection).
    - 14-Day Outbound & Reply dual-bar activity chart with hover details.
    - Timeframe filtering pills (`7 Days`, `14 Days`, `30 Days`, `All Time`) and instant CSV export.
    - Actionable AI Campaign Optimization insights.
  - Upgraded `components/dashboard/DashboardStats.tsx` with client-side live analytics auto-fetch.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (54/54 routes ✅).


### Milestone 11: Gmail Pub/Sub Webhook & AI Reply Intent Classifier
- **Date**: 2026-09-09
- **Status**: Completed ✅
- **Details**:
  - Implemented AI reply intent classifier in `lib/reply-classifier.ts`:
    - Leverages Claude 3 Haiku structured prompt to categorize inbound hiring replies (`positive`, `interested`, `rejection`, `not_a_fit`, `question`, `out_of_office`, `other`).
    - Produces confidence score, 1-sentence summary, and actionable candidate recommendation.
    - Heuristic rule engine fallback ensures zero downtime and resilient offline development.
  - Implemented inbound database transactions in `lib/db.ts`:
    - `recordInboundReply()` — persists to `email_replies`, triggers AI classification, updates linked `outreach_emails` to `replied`, and cascades status update to `companies`.
    - `getInboundRepliesForUser()` — retrieves user replies with outreach joins and classification filtering.
  - Built webhook and simulation API routes:
    - `POST /api/gmail/webhook` — Google Cloud Pub/Sub push notification receiver decoding base64 Gmail payloads.
    - `GET / POST /api/replies` — reply directory query and ingestion.
    - `POST /api/replies/simulate` — developer sandbox simulating realistic positive, interested, and rejection responses.
  - Built user interface and navigation:
    - `app/(dashboard)/replies/page.tsx` — tabbed sentiment view (All, Positive, Interested, Rejection), confidence badges, suggested actions, expandable thread preview, and simulator buttons.
    - Added Inbound Replies to `components/dashboard/Sidebar.tsx` and protected routes in `middleware.ts`.
    - Configured rewrites in `next.config.mjs` and generated `/dashboard` standalone overview page.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (55/55 routes ✅).


### Milestone 10: Email Dispatcher, Rate Limiting & Quota Protection
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented rate limiting & reset state machine in `lib/db.ts`:
    - `getAndResetSendLimits()` — Automatically resets daily count at UTC midnight and hourly count at the top of each hour.
    - `canSendEmail()` — Enforces strict safety limits: 20 emails/day, 5 emails/hour to protect Gmail sender reputation.
    - `incrementSendCount()` and `recordEmailDispatched()` — Synchronizes `send_limits`, `outreach_emails` status, and logs audit events in `email_events`.
  - Built dispatch API routes:
    - `GET /api/emails/rate-limit` — Returns live quotas, usage, and remaining send slots.
    - `POST /api/emails/send` — Single email dispatcher verifying limits and calling Gmail API.
    - `POST /api/emails/batch-send` — Dispatches all `ready_to_send` approved emails in sequential batch, safely stopping when limits are met.
  - Built UI components:
    - Created `components/emails/RateLimitWidget.tsx` with animated progress bars for daily and hourly quotas, batch send controls, and live dispatch summaries.
    - Embedded widget in review queue workflow.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (50/50 routes ✅).


### Milestone 9: Gmail OAuth Integration & Direct Inbox Connection
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented `lib/gmail.ts`:
    - Full Google OAuth authorization builder for sending (`gmail.send`) and inbox reading (`gmail.readonly`) scopes.
    - Automatic token persistence and silent token refreshing via `refresh_token` when nearing expiry.
    - RFC 2822 base64url message encoder.
    - Direct Gmail REST API message dispatcher (`/gmail/v1/users/me/messages/send`) with development fallback.
  - Built Gmail API route handlers:
    - `GET /api/gmail/connect` — Initiates OAuth flow with CSRF state nonce.
    - `GET /api/gmail/callback` — Validates state, exchanges code for tokens, retrieves user's Gmail address, saves in `gmail_tokens`, and redirects with confirmation.
    - `GET /api/gmail/status` — Returns integration status and active Gmail account.
    - `POST /api/gmail/disconnect` — Cleans up stored credentials.
  - Built UI components:
    - Created `components/emails/GmailConnectBanner.tsx` showing real-time connection status, linked Gmail address, and connect/disconnect controls.
    - Embedded banner across outreach dashboard and pending approval queues.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (47/47 routes ✅).


### Milestone 8: Human-in-the-Loop Email Review, Edit & Approval Workflow
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented backend approval endpoints:
    - `PUT /api/emails/:id` — Full edit persistence (subject, body, user edit audit) and status transitions (`draft` → `ready_to_send` / `approved`).
    - `POST /api/emails/:id/reject` — Marks draft as `rejected` while preserving database history.
  - Built interactive review modal in `components/emails/ApprovalModal.tsx`:
    - Full screen backdrop with company and contact badges, positioning angle, and context hook.
    - Inline edit mode with live word counter (target: 70–150 words).
    - Regenerate button invoking Claude AI directly.
    - Reject and "Approve & Queue" (`ready_to_send`) actions.
  - Built review queue page in `app/(dashboard)/emails/pending/page.tsx`:
    - Tabbed view: Pending Review (`draft`), Approved (`ready_to_send`), and All.
    - Real-time search by company name, recipient, or subject.
    - One-click review modal trigger.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (43/43 routes ✅).


### Milestone 7: Claude AI Cold Outreach Personalization Engine
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented `lib/claude.ts`:
    - Strict prompt engineering: synthesizes candidate's actual positioning (Fintech, Healthcare, or General SaaS) with company product hooks.
    - Word count guardrails (70–140 words, strictly capped under 150 words).
    - Tone tuning matching candidate's onboarding preference (Direct, Warm, or Formal).
    - Zero corporate clichés rule enforced.
    - High-fidelity offline fallback generator matching prompt rules for development resilience.
  - Implemented email persistence operations in `lib/db.ts`: `saveEmailDraft()`, `getEmailsForUser()`, and `updateEmailStatus()`.
  - Built API routes:
    - `POST /api/emails/draft` — Accepts `company_id` and optional `contact_id`, pulls candidate + company context, executes Claude generation, and persists to `outreach_emails` as `draft`.
    - `POST /api/emails` — Updates email status (approve to `ready_to_send`, edit subject/body, or mark as `rejected`).
    - `GET /api/emails` — Lists outreach drafts by user with company joins and status filtering.
  - Built frontend interfaces:
    - Upgraded `components/emails/EmailGenerator.tsx` with dynamic company selector, live drafting, real-time word counter with color feedback (ideal 70–150 words), positioning angle pill, and approve action.
    - Upgraded `components/emails/EmailApprovalUI.tsx` with status tabs (Drafts, Approved, All), expandable preview body, and quick approve/reject/undo actions.
    - Created `app/(dashboard)/emails/draft/page.tsx` for focused single-company drafting.
    - Updated `app/(dashboard)/emails/page.tsx` with unified dashboard view.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (42/42 routes ✅).


### Milestone 6: Flexible CSV Import & Smart Deduplication Engine
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented `lib/csv-parser.ts` with fuzzy/flexible column auto-detection (Company Name, Website, Career Page, Industry, Sponsor Rating, Personalization Hook, Contacts) and fallback industry inference.
  - Implemented company database operations in `lib/db.ts`: `normalizeCompanyName()`, `checkDuplicateCompanies()`, `importCompanies()`, and `getCompaniesForUser()`.
  - Built API endpoints:
    - `POST /api/companies/preview` — Parses uploaded CSV/text and runs duplicate checks against user's existing database records.
    - `POST /api/companies/import` — Executes import with `skip`, `replace`, or `merge` resolution strategies, tracking metrics in `company_imports`.
    - `GET /api/companies/sample` — Delivers pre-formatted CSV with 54 curated UK tech sponsors and Worker license ratings.
    - `GET /api/companies` — User company directory with search and industry filtering.
  - Built interactive frontend:
    - `app/(dashboard)/companies/import/page.tsx` — Drag-and-drop file upload, instant preview table, duplicate/new pill counts, duplicate strategy radio cards, campaign tags, and sample data loader.
    - `app/(dashboard)/companies/page.tsx` — Dynamic company directory with live search, industry category filters, and quick action buttons.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (40/40 routes ✅).


### Milestone 5: 10-Step User Profile Onboarding & DOCX Positioning Template
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented modular profile API endpoints:
    - `PUT /api/profile` — Full profile updates (demographics, visa requirement, target salary, story, tones).
    - `POST /api/profile/industries` — Industry positioning models for targeted verticals.
    - `POST /api/profile/skills` — Multi-category skill management (design, tools, domain).
    - `POST /api/profile/projects` — Dynamic project case study management with metrics and impact.
    - `GET /api/profile/template` — Generates and downloads standard `Personalization_Template.docx` via `docx` library.
  - Implemented full client state management in `components/onboarding/OnboardingContext.tsx` with auto-save feedback ("Saving..." / "✓ Saved").
  - Built high-contrast, responsive shell in `components/onboarding/OnboardingLayout.tsx` with progress bar, step pills, and Back/Next controls.
  - Built all 10 wizard step pages:
    - `step-1`: Welcome & pipeline explanation.
    - `step-2`: Basic info (name, location, years experience, target job title, URLs).
    - `step-3`: Professional background & target industry checkboxes.
    - `step-4`: Design skills, tools, and custom skill chips.
    - `step-5`: Dynamic project portfolio cards (1-6 projects).
    - `step-6`: Sponsorship requirements (UK Skilled Worker, target salary, availability, remote pref).
    - `step-7`: Fintech positioning textareas + DOCX template download.
    - `step-8`: Healthcare positioning textareas + DOCX template download.
    - `step-9`: Professional story, unique personal differentiator, and Claude writing voice selector (Direct / Warm / Formal).
    - `step-10`: Interactive summary review cards with final submission, setting `profile_complete_percent: 100` and `onboarding_complete: true`, redirecting to `/dashboard`.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (36/36 routes ✅).


### Milestone 4: Google OAuth 2.0 Authentication
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Created `lib/google-oauth.ts` — `buildGoogleOAuthUrl()`, `exchangeGoogleCode()`, `getGoogleProfile()`, `generateOAuthState()` using Google REST APIs directly.
  - Created `app/api/auth/google/route.ts` — CSRF-safe OAuth initiation: generates state nonce, stores in HTTP-only cookie, redirects to Google consent screen.
  - Replaced stub `app/api/auth/google-callback/route.ts` with full implementation: validates CSRF state, exchanges code for tokens, fetches Google profile, calls `getOrCreateGoogleUser()`, generates JWT, sets session cookie, redirects new users to `/onboarding` and returning users to `/dashboard`.
  - Added `getOrCreateGoogleUser()` to `lib/db.ts` — 3-step resolution: lookup by `google_id` → lookup by email (auto-links existing accounts) → create new user.
  - Updated `LoginForm.tsx` and `SignupForm.tsx` to read `?error=` query param from OAuth redirects and display gracefully.
  - Wrapped both auth forms in `<Suspense>` on their respective pages (required by `useSearchParams`).
  - Created `app/onboarding/page.tsx` — stub landing for new Google users (full wizard in Prompt 5).
  - Updated `middleware.ts` to protect `/onboarding/*`.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (22/22 routes ✅).

### Milestone 3: Email/Password Auth + Session Guard
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Implemented `/api/auth/signup` — bcrypt password hash, Zod validation, user+profile+send_limits auto-init.
  - Implemented `/api/auth/login` — bcrypt compare, JWT generation (7d), secure HTTP-only `sponsorflow_session` cookie.
  - Implemented `/api/auth/logout` — clears cookie and deletes session from `user_sessions` table.
  - Implemented `/api/auth/me` — reads JWT from cookie or Bearer header, returns user + profile.
  - Built `SignupForm.tsx` and `LoginForm.tsx` with React Hook Form + Zod validation.
  - Built `/signup` and `/login` pages with glassmorphic card layout and ambient glow effect.
  - Built `/google-callback` page (stub — full OAuth wired in Prompt 4).
  - Implemented `middleware.ts` — protects all `/dashboard/*`, `/profile/*`, `/companies/*`, `/emails/*`, `/analytics/*`, `/onboarding/*` routes; redirects logged-in users away from auth pages.
  - Fixed TypeScript compile errors: JWT `expiresIn` type cast and Supabase `createClient<any>` to avoid `never[]` inference on manually authored Database types.
  - Verified: `npx tsc --noEmit` (0 errors) + `npm run build` (20/20 routes ✅).

### Milestone 2: Next.js 14 Setup, Tailwind & Design System Tokens
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Scaffolded Next.js 14 (App Router) with TypeScript strict mode, Tailwind CSS, PostCSS, and `@/*` alias.
  - Configured Shopify-inspired design tokens in `tailwind.config.ts` and `app/globals.css` (canvas night, cream mint, aloe & pistachio accents, pill buttons, and glassmorphic panels).
  - Built core reusable UI primitives: `Button`, `Input`, `Card`, `Badge`.
  - Built navigation and layout structures: `Header`, `Sidebar`, `DashboardStats`.
  - Built email review & generation UI components: `EmailGenerator`, `EmailApprovalUI`.
  - Created marketing landing page (`app/page.tsx`) and auth pages (`/signup`, `/login`, `/google-callback`).
  - Created dashboard views (`/dashboard`, `/profile`, `/companies`, `/emails`, `/analytics`).
  - Implemented modular API route handlers (`/api/auth/*`, `/api/profile`, `/api/companies`, `/api/emails`, `/api/analytics`).
  - Verified with `npx tsc --noEmit` (0 errors) and `npm run build` (19/19 routes passed).

### Milestone 1: Database Schema, Indexes & RLS Migrations
- **Date**: 2026-09-05
- **Status**: Completed ✅
- **Details**:
  - Initialized Supabase configuration (`supabase/config.toml`).
  - Created initial migration `supabase/migrations/20260905180000_sponsorflow_initial_schema.sql` and single-file SQL reference `supabase/schema.sql`.
  - Defined all 17 core tables (`users`, `user_sessions`, `user_profiles`, `user_industries`, `user_skills`, `user_projects`, `user_documents`, `company_imports`, `companies`, `contacts`, `outreach_emails`, `email_events`, `email_replies`, `send_limits`, `gmail_tokens`, `analytics_daily`, `analytics_by_industry`).
  - Implemented Row-Level Security (RLS) on all 17 tables to ensure multi-tenant user data isolation.
  - Implemented utility functions (`normalize_company_name`, `email_hash`, `handle_updated_at`) and normalization triggers.
  - Created strict TypeScript interface definitions in `types/database.ts`.
  - Configured environment variable templates (`.env.example`, `.env.local`).

### Milestone 0: Workspace Setup & Repository Sync
- **Date**: 2026-09-05
- **Status**: Completed
- **Details**:
  - Linked workspace with `git@github.com-healthy:adedoyin899/healthy.git` on branch `main`.
  - Loaded `gstack` agent skill suite.
  - Verified and cataloged all design and implementation specs (`SPONSORFLOW-DESIGN.md`, `PROMPT-PACK-SPONSORFLOW-PHASE-1.md`, `shopifydesignskills.md`, `SPONSORFLOW-QUICK-START.md`).
  - Created live trackers: `PROCESS.md` and `BUG.md`.

