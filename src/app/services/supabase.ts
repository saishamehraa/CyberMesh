// src/app/services/supabase.ts
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables in Vite. Using dummy client for development if needed.");
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy-project-id.supabase.co', 
  supabaseAnonKey || 'dummy-anon-key'
);
