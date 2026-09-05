// ==============================================================================
// SponsorFlow: Auto-generated / Strongly-typed Database Definitions
// Generated from Supabase Schema: 17 Core Tables & Enums
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WritingTone = 'direct' | 'warm' | 'formal';
export type DocumentType = 'cv' | 'portfolio' | 'case_study' | 'template' | 'other';
export type SkillCategory = 'design' | 'tools' | 'other';
export type ImportStatus = 'processing' | 'completed' | 'failed';
export type CompanyStatus = 'new' | 'drafted' | 'ready_to_send' | 'contacted' | 'replied' | 'rejected' | 'archived';
export type ContactStatus = 'new' | 'contacted' | 'replied' | 'bounced' | 'unresponsive';
export type OutreachStatus = 'draft' | 'approved' | 'ready_to_send' | 'sending' | 'sent' | 'delivered' | 'failed' | 'rejected';
export type DeliveryStatus = 'sent' | 'delivered' | 'bounced';
export type EmailEventType = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
export type ReplyClassification = 'positive' | 'interested' | 'rejection' | 'question' | 'out_of_office';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          google_id: string | null;
          google_email: string | null;
          first_name: string | null;
          last_name: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string | null;
          google_id?: string | null;
          google_email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string | null;
          google_id?: string | null;
          google_email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
      };

      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
      };

      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          location: string | null;
          years_experience: number;
          target_job_title: string | null;
          linkedin_url: string | null;
          portfolio_url: string | null;
          professional_summary: string | null;
          design_philosophy: string | null;
          unique_thing: string | null;
          writing_tone: WritingTone;
          requires_sponsorship: boolean;
          target_salary_gbp: number | null;
          availability: string;
          remote_preference: string;
          onboarding_complete: boolean;
          profile_complete_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          location?: string | null;
          years_experience?: number;
          target_job_title?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          professional_summary?: string | null;
          design_philosophy?: string | null;
          unique_thing?: string | null;
          writing_tone?: WritingTone;
          requires_sponsorship?: boolean;
          target_salary_gbp?: number | null;
          availability?: string;
          remote_preference?: string;
          onboarding_complete?: boolean;
          profile_complete_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          location?: string | null;
          years_experience?: number;
          target_job_title?: string | null;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          professional_summary?: string | null;
          design_philosophy?: string | null;
          unique_thing?: string | null;
          writing_tone?: WritingTone;
          requires_sponsorship?: boolean;
          target_salary_gbp?: number | null;
          availability?: string;
          remote_preference?: string;
          onboarding_complete?: boolean;
          profile_complete_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_industries: {
        Row: {
          id: string;
          profile_id: string;
          industry: string;
          years_experience: number;
          experience_description: string | null;
          problems_solved: string | null;
          motivation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          industry: string;
          years_experience?: number;
          experience_description?: string | null;
          problems_solved?: string | null;
          motivation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          industry?: string;
          years_experience?: number;
          experience_description?: string | null;
          problems_solved?: string | null;
          motivation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_skills: {
        Row: {
          id: string;
          profile_id: string;
          skill_name: string;
          skill_category: SkillCategory;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          skill_name: string;
          skill_category?: SkillCategory;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          skill_name?: string;
          skill_category?: SkillCategory;
          created_at?: string;
        };
      };

      user_projects: {
        Row: {
          id: string;
          profile_id: string;
          project_name: string;
          company_name: string | null;
          year: number | null;
          description: string | null;
          role: string | null;
          industry: string | null;
          impact: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          project_name: string;
          company_name?: string | null;
          year?: number | null;
          description?: string | null;
          role?: string | null;
          industry?: string | null;
          impact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          project_name?: string;
          company_name?: string | null;
          year?: number | null;
          description?: string | null;
          role?: string | null;
          industry?: string | null;
          impact?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_documents: {
        Row: {
          id: string;
          user_id: string;
          document_type: DocumentType;
          file_name: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: DocumentType;
          file_name: string;
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_type?: DocumentType;
          file_name?: string;
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          uploaded_at?: string;
        };
      };

      company_imports: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_size: number | null;
          campaign_tag: string | null;
          companies_found: number;
          companies_duplicates: number;
          companies_imported: number;
          status: ImportStatus;
          error_message: string | null;
          uploaded_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_size?: number | null;
          campaign_tag?: string | null;
          companies_found?: number;
          companies_duplicates?: number;
          companies_imported?: number;
          status?: ImportStatus;
          error_message?: string | null;
          uploaded_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_size?: number | null;
          campaign_tag?: string | null;
          companies_found?: number;
          companies_duplicates?: number;
          companies_imported?: number;
          status?: ImportStatus;
          error_message?: string | null;
          uploaded_at?: string;
          completed_at?: string | null;
        };
      };

      companies: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          normalized_name: string;
          website: string | null;
          career_page: string | null;
          industry: string | null;
          location: string | null;
          sponsor_rating: string | null;
          personalization_hook: string | null;
          import_id: string | null;
          campaign_tag: string | null;
          external_id: string | null;
          status: CompanyStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          normalized_name?: string;
          website?: string | null;
          career_page?: string | null;
          industry?: string | null;
          location?: string | null;
          sponsor_rating?: string | null;
          personalization_hook?: string | null;
          import_id?: string | null;
          campaign_tag?: string | null;
          external_id?: string | null;
          status?: CompanyStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          normalized_name?: string;
          website?: string | null;
          career_page?: string | null;
          industry?: string | null;
          location?: string | null;
          sponsor_rating?: string | null;
          personalization_hook?: string | null;
          import_id?: string | null;
          campaign_tag?: string | null;
          external_id?: string | null;
          status?: CompanyStatus;
          created_at?: string;
          updated_at?: string;
        };
      };

      contacts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          name: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          email_hash: string | null;
          linkedin_url: string | null;
          job_title: string | null;
          status: ContactStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          name: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          email_hash?: string | null;
          linkedin_url?: string | null;
          job_title?: string | null;
          status?: ContactStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          name?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          email_hash?: string | null;
          linkedin_url?: string | null;
          job_title?: string | null;
          status?: ContactStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      outreach_emails: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          contact_id: string | null;
          to_email: string;
          to_name: string | null;
          subject: string;
          body: string;
          status: OutreachStatus;
          scheduled_for: string | null;
          sent_at: string | null;
          delivery_status: DeliveryStatus | null;
          opened_at: string | null;
          clicked_at: string | null;
          ai_model: string;
          ai_positioning_angle: string | null;
          ai_confidence: number;
          approved_by_user: boolean;
          approved_at: string | null;
          user_edits: string | null;
          gmail_message_id: string | null;
          gmail_thread_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          contact_id?: string | null;
          to_email: string;
          to_name?: string | null;
          subject: string;
          body: string;
          status?: OutreachStatus;
          scheduled_for?: string | null;
          sent_at?: string | null;
          delivery_status?: DeliveryStatus | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          ai_model?: string;
          ai_positioning_angle?: string | null;
          ai_confidence?: number;
          approved_by_user?: boolean;
          approved_at?: string | null;
          user_edits?: string | null;
          gmail_message_id?: string | null;
          gmail_thread_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          contact_id?: string | null;
          to_email?: string;
          to_name?: string | null;
          subject?: string;
          body?: string;
          status?: OutreachStatus;
          scheduled_for?: string | null;
          sent_at?: string | null;
          delivery_status?: DeliveryStatus | null;
          opened_at?: string | null;
          clicked_at?: string | null;
          ai_model?: string;
          ai_positioning_angle?: string | null;
          ai_confidence?: number;
          approved_by_user?: boolean;
          approved_at?: string | null;
          user_edits?: string | null;
          gmail_message_id?: string | null;
          gmail_thread_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      email_events: {
        Row: {
          id: string;
          outreach_email_id: string;
          event_type: EmailEventType;
          clicked_link: string | null;
          event_timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          outreach_email_id: string;
          event_type: EmailEventType;
          clicked_link?: string | null;
          event_timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          outreach_email_id?: string;
          event_type?: EmailEventType;
          clicked_link?: string | null;
          event_timestamp?: string;
          created_at?: string;
        };
      };

      email_replies: {
        Row: {
          id: string;
          user_id: string;
          outreach_email_id: string | null;
          gmail_message_id: string | null;
          gmail_thread_id: string | null;
          from_email: string;
          from_name: string | null;
          subject: string | null;
          body: string;
          received_at: string;
          ai_classification: ReplyClassification | null;
          ai_confidence: number;
          ai_summary: string | null;
          suggested_action: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          outreach_email_id?: string | null;
          gmail_message_id?: string | null;
          gmail_thread_id?: string | null;
          from_email: string;
          from_name?: string | null;
          subject?: string | null;
          body: string;
          received_at?: string;
          ai_classification?: ReplyClassification | null;
          ai_confidence?: number;
          ai_summary?: string | null;
          suggested_action?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          outreach_email_id?: string | null;
          gmail_message_id?: string | null;
          gmail_thread_id?: string | null;
          from_email?: string;
          from_name?: string | null;
          subject?: string | null;
          body?: string;
          received_at?: string;
          ai_classification?: ReplyClassification | null;
          ai_confidence?: number;
          ai_summary?: string | null;
          suggested_action?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };

      send_limits: {
        Row: {
          id: string;
          user_id: string;
          daily_limit: number;
          hourly_limit: number;
          emails_sent_today: number;
          emails_sent_this_hour: number;
          last_reset_date: string;
          last_reset_hour: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_limit?: number;
          hourly_limit?: number;
          emails_sent_today?: number;
          emails_sent_this_hour?: number;
          last_reset_date?: string;
          last_reset_hour?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_limit?: number;
          hourly_limit?: number;
          emails_sent_today?: number;
          emails_sent_this_hour?: number;
          last_reset_date?: string;
          last_reset_hour?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      gmail_tokens: {
        Row: {
          id: string;
          user_id: string;
          access_token: string;
          refresh_token: string | null;
          scope: string | null;
          token_type: string;
          expiry_date: number | null;
          gmail_email: string | null;
          connected_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          access_token: string;
          refresh_token?: string | null;
          scope?: string | null;
          token_type?: string;
          expiry_date?: number | null;
          gmail_email?: string | null;
          connected_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          access_token?: string;
          refresh_token?: string | null;
          scope?: string | null;
          token_type?: string;
          expiry_date?: number | null;
          gmail_email?: string | null;
          connected_at?: string;
          updated_at?: string;
        };
      };

      analytics_daily: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          emails_sent: number;
          emails_delivered: number;
          emails_bounced: number;
          emails_opened: number;
          open_rate: number;
          emails_clicked: number;
          click_rate: number;
          emails_replied: number;
          reply_rate: number;
          positive_replies: number;
          rejection_replies: number;
          interviews_scheduled: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          emails_sent?: number;
          emails_delivered?: number;
          emails_bounced?: number;
          emails_opened?: number;
          open_rate?: number;
          emails_clicked?: number;
          click_rate?: number;
          emails_replied?: number;
          reply_rate?: number;
          positive_replies?: number;
          rejection_replies?: number;
          interviews_scheduled?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          emails_sent?: number;
          emails_delivered?: number;
          emails_bounced?: number;
          emails_opened?: number;
          open_rate?: number;
          emails_clicked?: number;
          click_rate?: number;
          emails_replied?: number;
          reply_rate?: number;
          positive_replies?: number;
          rejection_replies?: number;
          interviews_scheduled?: number;
          created_at?: string;
        };
      };

      analytics_by_industry: {
        Row: {
          id: string;
          user_id: string;
          industry: string;
          companies_targeted: number;
          emails_sent: number;
          replies: number;
          reply_rate: number;
          positive_replies: number;
          interviews: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          industry: string;
          companies_targeted?: number;
          emails_sent?: number;
          replies?: number;
          reply_rate?: number;
          positive_replies?: number;
          interviews?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          industry?: string;
          companies_targeted?: number;
          emails_sent?: number;
          replies?: number;
          reply_rate?: number;
          positive_replies?: number;
          interviews?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      normalize_company_name: {
        Args: { raw_name: string };
        Returns: string;
      };
      email_hash: {
        Args: { raw_email: string };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
