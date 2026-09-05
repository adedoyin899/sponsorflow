-- ==============================================================================
-- SponsorFlow: Complete Database Schema & Migrations
-- Phase 1: 17 Core Tables, Row Level Security, Indexes & Utility Functions
-- ==============================================================================

-- Enable UUID and Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. HELPER & UTILITY FUNCTIONS
-- ==============================================================================

-- Function: Standardize company names for duplicate matching
CREATE OR REPLACE FUNCTION normalize_company_name(raw_name TEXT)
RETURNS TEXT AS $$
BEGIN
  IF raw_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(raw_name, '\s+(ltd|limited|inc|incorporated|corp|corporation|llc|plc|gmbh|co)\.?$', '', 'gi'),
          '[^\w\s]', '', 'g'
        ),
        '\s+', ' ', 'g'
      )
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Compute SHA256 email hash for deduplication
CREATE OR REPLACE FUNCTION email_hash(raw_email TEXT)
RETURNS TEXT AS $$
BEGIN
  IF raw_email IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN ENCODE(DIGEST(LOWER(TRIM(raw_email)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Automatic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. USERS & AUTHENTICATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  google_email TEXT,
  first_name TEXT,
  last_name TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync with Supabase auth.users if available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, email_verified, google_id, google_email)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    (NEW.email_confirmed_at IS NOT NULL),
    NEW.raw_user_meta_data->>'sub',
    NEW.raw_user_meta_data->>'email'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    email_verified = (NEW.email_confirmed_at IS NOT NULL),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 3. USER PROFILES & ONBOARDING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  location TEXT,
  years_experience INT DEFAULT 0,
  target_job_title TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  professional_summary TEXT,
  design_philosophy TEXT,
  unique_thing TEXT,
  writing_tone VARCHAR(50) DEFAULT 'direct', -- 'direct', 'warm', 'formal'
  requires_sponsorship BOOLEAN DEFAULT true,
  target_salary_gbp INT,
  availability TEXT DEFAULT 'immediate',
  remote_preference TEXT DEFAULT 'hybrid',
  onboarding_complete BOOLEAN DEFAULT false,
  profile_complete_percent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  industry VARCHAR(100) NOT NULL, -- fintech, healthcare, saas, etc.
  years_experience INT DEFAULT 0,
  experience_description TEXT,
  problems_solved TEXT,
  motivation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, industry)
);

CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category VARCHAR(50) DEFAULT 'design', -- design, tools, other
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  company_name TEXT,
  year INT,
  description TEXT,
  role TEXT,
  industry VARCHAR(100),
  impact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- cv, portfolio, case_study, template, other
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. COMPANIES & CONTACTS (WITH DEDUPLICATION)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.company_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  campaign_tag TEXT,
  companies_found INT DEFAULT 0,
  companies_duplicates INT DEFAULT 0,
  companies_imported INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  error_message TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  website TEXT,
  career_page TEXT,
  industry TEXT,
  location TEXT,
  sponsor_rating TEXT, -- e.g. Worker (A rating)
  personalization_hook TEXT,
  import_id UUID REFERENCES public.company_imports(id) ON DELETE SET NULL,
  campaign_tag TEXT,
  external_id TEXT,
  status VARCHAR(50) DEFAULT 'new', -- new, drafted, ready_to_send, contacted, replied, rejected, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, normalized_name)
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  email_hash TEXT,
  linkedin_url TEXT,
  job_title TEXT,
  status VARCHAR(50) DEFAULT 'new', -- new, contacted, replied, bounced, unresponsive
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-normalize company names on insert/update
CREATE OR REPLACE FUNCTION trigger_normalize_company()
RETURNS TRIGGER AS $$
BEGIN
  NEW.normalized_name = normalize_company_name(NEW.company_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_normalize_company_name
BEFORE INSERT OR UPDATE OF company_name ON public.companies
FOR EACH ROW EXECUTE FUNCTION trigger_normalize_company();

-- Trigger to auto-hash contact emails
CREATE OR REPLACE FUNCTION trigger_hash_contact_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email_hash = email_hash(NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_hash_contact_email
BEFORE INSERT OR UPDATE OF email ON public.contacts
FOR EACH ROW EXECUTE FUNCTION trigger_hash_contact_email();

-- ==============================================================================
-- 5. EMAIL OUTREACH, EVENTS & REPLIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.outreach_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  to_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, approved, ready_to_send, sending, sent, delivered, failed, rejected
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivery_status VARCHAR(50), -- sent, delivered, bounced
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  ai_model TEXT DEFAULT 'claude-3-5-sonnet-latest',
  ai_positioning_angle TEXT,
  ai_confidence INT DEFAULT 100,
  approved_by_user BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  user_edits TEXT,
  gmail_message_id TEXT,
  gmail_thread_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_email_id UUID NOT NULL REFERENCES public.outreach_emails(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, bounced
  clicked_link TEXT,
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  outreach_email_id UUID REFERENCES public.outreach_emails(id) ON DELETE SET NULL,
  gmail_message_id TEXT UNIQUE,
  gmail_thread_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  ai_classification VARCHAR(50), -- positive, interested, rejection, question, out_of_office
  ai_confidence INT DEFAULT 0,
  ai_summary TEXT,
  suggested_action TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. SEND LIMITS & RATE LIMITING
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.send_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  daily_limit INT DEFAULT 20,
  hourly_limit INT DEFAULT 5,
  emails_sent_today INT DEFAULT 0,
  emails_sent_this_hour INT DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  last_reset_hour INT DEFAULT EXTRACT(HOUR FROM NOW()),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. GMAIL OAUTH TOKENS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gmail_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  scope TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expiry_date BIGINT,
  gmail_email TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ANALYTICS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emails_sent INT DEFAULT 0,
  emails_delivered INT DEFAULT 0,
  emails_bounced INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  open_rate FLOAT DEFAULT 0.0,
  emails_clicked INT DEFAULT 0,
  click_rate FLOAT DEFAULT 0.0,
  emails_replied INT DEFAULT 0,
  reply_rate FLOAT DEFAULT 0.0,
  positive_replies INT DEFAULT 0,
  rejection_replies INT DEFAULT 0,
  interviews_scheduled INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.analytics_by_industry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  industry TEXT NOT NULL,
  companies_targeted INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  replies INT DEFAULT 0,
  reply_rate FLOAT DEFAULT 0.0,
  positive_replies INT DEFAULT 0,
  interviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, industry)
);

-- ==============================================================================
-- 9. UPDATED_AT TRIGGERS
-- ==============================================================================

CREATE OR REPLACE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_user_industries_updated_at BEFORE UPDATE ON public.user_industries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_user_projects_updated_at BEFORE UPDATE ON public.user_projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_outreach_emails_updated_at BEFORE UPDATE ON public.outreach_emails FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_send_limits_updated_at BEFORE UPDATE ON public.send_limits FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_gmail_tokens_updated_at BEFORE UPDATE ON public.gmail_tokens FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE OR REPLACE TRIGGER trg_analytics_by_industry_updated_at BEFORE UPDATE ON public.analytics_by_industry FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ==============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_industries_profile_id ON public.user_industries(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_profile_id ON public.user_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_profile_id ON public.user_projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_normalized ON public.companies(user_id, normalized_name);
CREATE INDEX IF NOT EXISTS idx_companies_user_status ON public.companies(user_id, status);
CREATE INDEX IF NOT EXISTS idx_companies_import_id ON public.companies(import_id);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_email_hash ON public.contacts(user_id, email_hash);

CREATE INDEX IF NOT EXISTS idx_outreach_emails_user_id ON public.outreach_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_user_status ON public.outreach_emails(user_id, status);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_user_sent_at ON public.outreach_emails(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_outreach_emails_company_id ON public.outreach_emails(company_id);

CREATE INDEX IF NOT EXISTS idx_email_events_outreach_id ON public.email_events(outreach_email_id);
CREATE INDEX IF NOT EXISTS idx_email_replies_user_received ON public.email_replies(user_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_replies_outreach_id ON public.email_replies(outreach_email_id);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_user_date ON public.analytics_daily(user_id, date DESC);

-- ==============================================================================
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.send_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_by_industry ENABLE ROW LEVEL SECURITY;

-- 1. users
CREATE POLICY "Users can view their own record" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 2. user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 3. user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. user_industries (joined through user_profiles)
CREATE POLICY "Users can manage own industries" ON public.user_industries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = user_industries.profile_id AND user_profiles.user_id = auth.uid())
  );

-- 5. user_skills
CREATE POLICY "Users can manage own skills" ON public.user_skills
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = user_skills.profile_id AND user_profiles.user_id = auth.uid())
  );

-- 6. user_projects
CREATE POLICY "Users can manage own projects" ON public.user_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.id = user_projects.profile_id AND user_profiles.user_id = auth.uid())
  );

-- 7. user_documents
CREATE POLICY "Users can manage own documents" ON public.user_documents
  FOR ALL USING (auth.uid() = user_id);

-- 8. company_imports
CREATE POLICY "Users can manage own imports" ON public.company_imports
  FOR ALL USING (auth.uid() = user_id);

-- 9. companies
CREATE POLICY "Users can manage own companies" ON public.companies
  FOR ALL USING (auth.uid() = user_id);

-- 10. contacts
CREATE POLICY "Users can manage own contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

-- 11. outreach_emails
CREATE POLICY "Users can manage own outreach emails" ON public.outreach_emails
  FOR ALL USING (auth.uid() = user_id);

-- 12. email_events
CREATE POLICY "Users can view own email events" ON public.email_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.outreach_emails WHERE outreach_emails.id = email_events.outreach_email_id AND outreach_emails.user_id = auth.uid())
  );

-- 13. email_replies
CREATE POLICY "Users can manage own email replies" ON public.email_replies
  FOR ALL USING (auth.uid() = user_id);

-- 14. send_limits
CREATE POLICY "Users can manage own send limits" ON public.send_limits
  FOR ALL USING (auth.uid() = user_id);

-- 15. gmail_tokens
CREATE POLICY "Users can manage own gmail tokens" ON public.gmail_tokens
  FOR ALL USING (auth.uid() = user_id);

-- 16. analytics_daily
CREATE POLICY "Users can manage own daily analytics" ON public.analytics_daily
  FOR ALL USING (auth.uid() = user_id);

-- 17. analytics_by_industry
CREATE POLICY "Users can manage own industry analytics" ON public.analytics_by_industry
  FOR ALL USING (auth.uid() = user_id);
