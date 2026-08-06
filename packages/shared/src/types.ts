export interface WalkinDrive {
  id: string;
  company_name: string;
  job_title: string;
  experience_range: string;
  experience_min: number;
  experience_max: number;
  walkin_start_date: string; // ISO date string or YYYY-MM-DD
  walkin_end_date?: string;
  time_slot?: string;
  city: string;
  it_park_name: string;
  landmark_gate: string;
  trust_score: number; // 0 to 100
  contains_payment_demand: boolean;
  raw_text?: string;
  contact_email?: string;
  venue_address?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface IngestNoticeRequest {
  raw_text: string;
}

export interface IngestNoticeResponse {
  success: boolean;
  data: WalkinDrive;
  message?: string;
  parsed_attributes?: Partial<WalkinDrive>;
}

export interface DriveFilterOptions {
  city?: string;
  it_park_name?: string;
  experience?: string;
  search?: string;
  min_trust_score?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  error?: string;
}

export type TrustCategory = 'HIGH' | 'MODERATE' | 'LOW';

export function getTrustCategory(score: number): TrustCategory {
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MODERATE';
  return 'LOW';
}
