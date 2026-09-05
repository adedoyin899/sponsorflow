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

*(No active bugs reported. Log will be updated as development proceeds.)*

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
