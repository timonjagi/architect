import { createClient } from '@supabase/supabase-js';

// These would ideally be in process.env, but we provide placeholders for setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**`
 * SQL SCHEMA FOR REFERENCE:
 * 
 * create table projects (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   framework text,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * create table sources (
 *   id uuid primary key default gen_random_uuid(),
 *   project_id uuid references projects(id) on delete cascade,
 *   name text not null,
 *   content text not null,
 *   type text not null,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * create table artifacts (
 *   id uuid primary key default gen_random_uuid(),
 *   project_id uuid references projects(id) on delete cascade,
 *   result jsonb not null,
 *   prompt text,
 *   created_at timestamp with time zone default now()
 * );
 */
