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
