export * from "./database";

export interface UserSession {
  user: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
  };
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OutreachDraftRequest {
  company_id: string;
  contact_id?: string;
  custom_hook?: string;
}

export interface OutreachDraftResponse {
  subject: string;
  body: string;
  positioning_angle: string;
  confidence: number;
}
