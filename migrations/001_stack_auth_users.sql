-- Migration: Create users table for Stack Auth integration
-- Stack Auth manages authentication externally, but we need a local users table
-- for foreign key references from user-related tables.

-- 1. Create a simple users table to store Stack Auth user references
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Drop existing FK constraints that reference auth.users
-- (These were from Supabase and won't work with Stack Auth)

ALTER TABLE public.collections DROP CONSTRAINT IF EXISTS collections_user_id_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.user_highlights DROP CONSTRAINT IF EXISTS user_highlights_user_id_fkey;
ALTER TABLE public.user_notes DROP CONSTRAINT IF EXISTS user_notes_user_id_fkey;
ALTER TABLE public.user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE public.user_story_progress DROP CONSTRAINT IF EXISTS user_story_progress_user_id_fkey;
ALTER TABLE public.user_token_translations DROP CONSTRAINT IF EXISTS user_token_translations_user_id_fkey;
ALTER TABLE public.user_translations DROP CONSTRAINT IF EXISTS user_translations_user_id_fkey;
ALTER TABLE public.user_vocabulary DROP CONSTRAINT IF EXISTS user_vocabulary_user_id_fkey;
ALTER TABLE public.word_translations DROP CONSTRAINT IF EXISTS word_translations_user_id_fkey;

-- 3. Add new FK constraints referencing public.users
ALTER TABLE public.collections 
  ADD CONSTRAINT collections_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.documents 
  ADD CONSTRAINT documents_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_highlights 
  ADD CONSTRAINT user_highlights_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_notes 
  ADD CONSTRAINT user_notes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_settings 
  ADD CONSTRAINT user_settings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_story_progress 
  ADD CONSTRAINT user_story_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_token_translations 
  ADD CONSTRAINT user_token_translations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_translations 
  ADD CONSTRAINT user_translations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_vocabulary 
  ADD CONSTRAINT user_vocabulary_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.word_translations 
  ADD CONSTRAINT word_translations_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
