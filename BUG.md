# SponsorFlow: Bug & Issue Tracker

> **Live Document**: This file logs all identified bugs, edge-case failures, root causes, applied fixes, and prevention mechanisms throughout development.

---

## 📋 Bug Log Schema

Every bug entry should follow this structure:
- **ID**: `BUG-XXX`
- **Date Discovered**: YYYY-MM-DD
- **Severity**: `Critical` | `High` | `Medium` | `Low`
- **Component**: E.g., `Auth`, `Onboarding`, `CSV Import`, `AI Generation`, `Gmail Dispatch`, `Analytics`
- **Description**: What went wrong and how to reproduce it.
- **Root Cause**: Why it happened.
- **Resolution**: How it was fixed (including relevant commit / file paths).
- **Prevention**: Measures taken to avoid regression (e.g., unit tests, type checks, schema constraints).

---

## 🐛 Bug History

### Template Entry (Example)
<!--
### BUG-001: Example Issue Title
- **Date**: 2026-09-05
- **Severity**: Low
- **Component**: Auth / Session
- **Status**: [Resolved]
- **Description**: User token expired unexpectedly during tab switch.
- **Root Cause**: Cookie maxAge was set to 0 instead of session duration.
- **Resolution**: Corrected maxAge to 604800 (7 days) in `lib/auth.ts`.
- **Prevention**: Added automated unit test for session cookie generation.
-->

### BUG-001: JWT `expiresIn` Type Error (`@types/jsonwebtoken` v9+)
- **Date**: 2026-09-05
- **Severity**: Medium
- **Component**: Auth / Session
- **Status**: [Resolved ✅]
- **Description**: `jwt.sign(payload, secret, { expiresIn })` caused TypeScript error `TS2769: No overload matches this call` because `@types/jsonwebtoken` v9 changed `expiresIn` to accept `StringValue | number` (not `string`).
- **Root Cause**: Breaking type change in `@types/jsonwebtoken@^9` — the `StringValue` branded type is no longer assignable from `string`.
- **Resolution**: Added `expiresIn: expiresIn as any` cast in [`lib/auth.ts`](file:///Users/oyeniyiadedoyin/Desktop/Anti%20gravity%20Projects/Sponsorflow/lib/auth.ts).
- **Prevention**: Runtime value is correct; type cast is isolated to one line. Will revisit if `jsonwebtoken` v10 resolves this typing.

### BUG-002: Supabase `createClient<Database>` causing `never[]` on `.insert()` calls
- **Date**: 2026-09-05
- **Severity**: High
- **Component**: Database / DB Layer
- **Status**: [Resolved ✅]
- **Description**: Using a manually-authored `Database` generic with `createClient<Database>` caused all `.from("table").insert({...})` calls to be typed as `never[]`, blocking compilation.
- **Root Cause**: Supabase's internal generic resolution requires the Database type to exactly match its internal schema structure. Manually authored types (not Supabase CLI-generated) do not satisfy the strict internal type constraints, causing the insert type to collapse to `never`.
- **Resolution**: Switched to `createClient<any>` in [`lib/supabase-server.ts`](file:///Users/oyeniyiadedoyin/Desktop/Anti%20gravity%20Projects/Sponsorflow/lib/supabase-server.ts) and applied explicit return type casts in [`lib/db.ts`](file:///Users/oyeniyiadedoyin/Desktop/Anti%20gravity%20Projects/Sponsorflow/lib/db.ts).
- **Prevention**: Long-term: run `supabase gen types typescript` after deploying schema to generate a correctly structured Database type. For now, explicit casts ensure type safety at the call site.

### BUG-003: Vercel Server File Trace Manifest Collision (`page_client-reference-manifest.js ENOENT`)
- **Date**: 2026-09-09
- **Severity**: Critical
- **Component**: Next.js App Router / Deployment
- **Status**: [Resolved ✅]
- **Description**: Vercel production deployment failed during server file tracing with: `Error: ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/(dashboard)/page_client-reference-manifest.js'`.
- **Root Cause**: Coexistence of root `app/page.tsx` and route-group `app/(dashboard)/page.tsx`. In Next.js App Router, route groups `(group)` do not introduce URL path segments, so both pages targeted `/`. During Next.js production build tracing, the client reference manifest for `app/(dashboard)/page` was overwritten/deleted by `app/page`, causing the trace step to fail on the missing manifest.
- **Resolution**: Removed duplicate `app/(dashboard)/page.tsx` and consolidated the main dashboard under `app/(dashboard)/dashboard/page.tsx` with rewrite routing in `next.config.mjs`. Cleared build cache and confirmed zero collisions.
- **Prevention**: Never create identical route paths across route groups and root app directory.

### BUG-004: Strict UUID Validator Rejecting Demo/Sample Entities in API Routes
- **Date**: 2026-09-09
- **Severity**: High
- **Component**: API Routes / Validation
- **Status**: [Resolved ✅]
- **Description**: Calling `/api/emails/draft`, `/api/emails/batch-send`, or `/api/replies/simulate` with sample company IDs (e.g., `"1"`) or mock IDs failed with Zod validation error: `"Invalid company ID"`.
- **Root Cause**: Schemas strictly required `z.string().uuid()` instead of `z.string().min(1)`, causing pre-populated sample sponsors to fail validation before AI drafting.
- **Resolution**: Updated `draftRequestSchema`, `batchSendSchema`, and `simulateSchema` to accept any non-empty string identifier (`z.string().min(1)`), and added sample company lookup fallbacks.
- **Prevention**: Use relaxed string constraints on user-facing API routes where mock or imported external IDs might exist alongside UUIDs.

### BUG-005: Header User Email Statically Hardcoded to `"doyin@example.com"`
- **Date**: 2026-09-09
- **Severity**: Medium
- **Component**: Dashboard Header / Auth UI
- **Status**: [Resolved ✅]
- **Description**: The top navigation bar always displayed `doyin@example.com` regardless of which account was authenticated.
- **Root Cause**: `DashboardLayout` passed a hardcoded string `userEmail="doyin@example.com"` to `Header`.
- **Resolution**: Removed hardcoded prop and updated `Header.tsx` to dynamically query `/api/auth/me` on mount to display the actual authenticated user's email, with a fallback to "Member".
- **Prevention**: Always decouple user session state from presentation layout wrappers.

---

## 🛡️ Known Edge Cases to Guard Against

1. **Email Deduplication**:
   - Duplicate contacts across different CSV imports must be detected using normalized lowercased email hashes.
   - Company name fuzzy matching must prevent creating duplicate company records (e.g., "Airbnb Inc" vs "Airbnb").
2. **Gmail API Rate Limits**:
   - Enforce hard daily cap (20/day) and burst cap (5/hour) in database before making external API requests.
3. **Claude Token Limits & Malformed Outputs**:
   - Handle timeout or markdown fence errors when parsing AI response payloads into `{ subject, body }`.
4. **Supabase RLS Leaks**:
   - Ensure every table has strict `auth.uid() = user_id` policies so no user can read another's contacts or drafted outreach.
