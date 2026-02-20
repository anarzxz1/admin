import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TableReservation {
  id: string;
  table_number: number;
  badge_number: string;
  created_at: string;
}

export interface BlacklistEntry {
  id: string;
  badge_number: string;
  comment: string;
  created_at: string;
}

export interface TableHistory {
  id: string;
  table_number: number;
  badge_number: string;
  started_at: string;
  completed_at: string;
  created_at: string;
}

export interface PalletOrder {
  id: string;
  table_number: number;
  badge_number: string;
  status: 'pending' | 'completed';
  created_at: string;
  completed_at: string | null;
}
