import { createClient } from '@supabase/supabase-js';

// These would ideally be in process.env, but we provide placeholders for setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
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
