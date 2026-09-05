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
[Prompt 1]  Database Schema & RLS Migrations          [Pending]
[Prompt 2]  Next.js 14 Setup + Tailwind Design System [Pending]
[Prompt 3]  Email/Password Auth + Session Guard       [Pending]
[Prompt 4]  Google OAuth 2.0 Authentication           [Pending]
[Prompt 5]  10-Step User Profile Onboarding           [Pending]
[Prompt 6]  CSV Import & Smart Deduplication          [Pending]
[Prompt 7]  Claude AI Email Generation Engine         [Pending]
[Prompt 8]  Email Review, Edit & Approval Workflow    [Pending]
[Prompt 9]  Gmail OAuth Integration                   [Pending]
[Prompt 10] Email Dispatcher & Rate Limiter           [Pending]
[Prompt 11] Gmail Pub/Sub Webhook & AI Classifier     [Pending]
[Prompt 12] Outreach Pipeline & Analytics Dashboard   [Pending]
```

---

## 5. 🏗️ Build Log & Milestones

### Milestone 0: Workspace Setup & Repository Sync
- **Date**: 2026-09-05
- **Status**: Completed
- **Details**:
  - Linked workspace with `git@github.com-healthy:adedoyin899/healthy.git` on branch `main`.
  - Loaded `gstack` agent skill suite.
  - Verified and cataloged all design and implementation specs (`SPONSORFLOW-DESIGN.md`, `PROMPT-PACK-SPONSORFLOW-PHASE-1.md`, `shopifydesignskills.md`, `SPONSORFLOW-QUICK-START.md`).
  - Created live trackers: `PROCESS.md` and `BUG.md`.
