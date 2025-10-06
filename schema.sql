-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audio_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_revision_id uuid NOT NULL,
  kind text DEFAULT 'narration'::text,
  url text NOT NULL,
  meta jsonb,
  CONSTRAINT audio_assets_pkey PRIMARY KEY (id),
  CONSTRAINT audio_assets_story_revision_id_fkey FOREIGN KEY (story_revision_id) REFERENCES public.story_revisions(id)
);
CREATE TABLE public.chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  title text,
  position integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chapters_pkey PRIMARY KEY (id),
  CONSTRAINT chapters_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id)
);
CREATE TABLE public.collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_url text,
  CONSTRAINT collections_pkey PRIMARY KEY (id),
  CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  original_text text NOT NULL,
  word_count integer DEFAULT 0,
  paragraph_count integer DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  image_url text,
  description text,
  language_code character varying NOT NULL DEFAULT 'ro'::character varying,
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.collections(id),
  CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.format_spans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_revision_id uuid NOT NULL,
  segment_id uuid NOT NULL,
  start_tok_index integer NOT NULL,
  end_tok_index integer NOT NULL,
  style jsonb NOT NULL,
  CONSTRAINT format_spans_pkey PRIMARY KEY (id),
  CONSTRAINT format_spans_story_revision_id_fkey FOREIGN KEY (story_revision_id) REFERENCES public.story_revisions(id),
  CONSTRAINT format_spans_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id)
);
CREATE TABLE public.languages (
  code text NOT NULL,
  name text NOT NULL,
  CONSTRAINT languages_pkey PRIMARY KEY (code)
);
CREATE TABLE public.lesson_stats (
  document_id uuid NOT NULL,
  total_tokens integer NOT NULL DEFAULT 0,
  total_types integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lesson_stats_pkey PRIMARY KEY (document_id),
  CONSTRAINT lesson_stats_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.lesson_word_counts (
  document_id uuid NOT NULL,
  normalized_word text NOT NULL,
  occurrence_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lesson_word_counts_pkey PRIMARY KEY (normalized_word, document_id),
  CONSTRAINT lesson_word_counts_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);
CREATE TABLE public.lexemes (
  lemma_key text NOT NULL,
  language_code text,
  lemma text NOT NULL,
  extra jsonb,
  CONSTRAINT lexemes_pkey PRIMARY KEY (lemma_key),
  CONSTRAINT lexemes_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website text,
  native_language character varying NOT NULL DEFAULT 'en'::character varying,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.user_settings (
  user_id uuid NOT NULL,
  last_seen_discover_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.segments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_revision_id uuid NOT NULL,
  chapter_id uuid NOT NULL,
  seg_index integer NOT NULL,
  kind text DEFAULT 'paragraph'::text,
  attrs jsonb,
  CONSTRAINT segments_pkey PRIMARY KEY (id),
  CONSTRAINT segments_story_revision_id_fkey FOREIGN KEY (story_revision_id) REFERENCES public.story_revisions(id),
  CONSTRAINT segments_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id)
);
CREATE TABLE public.stories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  source text,
  license text,
  language_code text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stories_pkey PRIMARY KEY (id),
  CONSTRAINT stories_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code)
);
CREATE TABLE public.story_genre_links (
  story_id uuid NOT NULL,
  genre_id uuid NOT NULL,
  CONSTRAINT story_genre_links_pkey PRIMARY KEY (story_id, genre_id),
  CONSTRAINT story_genre_links_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id),
  CONSTRAINT story_genre_links_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.story_genres(id)
);
CREATE TABLE public.story_genres (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT story_genres_pkey PRIMARY KEY (id)
);
CREATE TABLE public.story_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  rev integer NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT story_revisions_pkey PRIMARY KEY (id),
  CONSTRAINT story_revisions_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id)
);
CREATE TABLE public.token_timings (
  audio_id uuid NOT NULL,
  token_id text NOT NULL,
  t_start_ms integer NOT NULL,
  t_end_ms integer NOT NULL,
  CONSTRAINT token_timings_pkey PRIMARY KEY (audio_id, token_id),
  CONSTRAINT token_timings_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audio_assets(id),
  CONSTRAINT token_timings_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id)
);
CREATE TABLE public.tokens (
  id text NOT NULL,
  story_revision_id uuid NOT NULL,
  segment_id uuid NOT NULL,
  seg_index integer NOT NULL,
  tok_index integer NOT NULL,
  text text NOT NULL,
  norm text,
  lemma_key text,
  token_type text DEFAULT 'word'::text,
  style jsonb,
  chapter_id uuid NOT NULL,
  CONSTRAINT tokens_pkey PRIMARY KEY (id),
  CONSTRAINT tokens_story_revision_id_fkey FOREIGN KEY (story_revision_id) REFERENCES public.story_revisions(id),
  CONSTRAINT tokens_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id),
  CONSTRAINT tokens_chapter_id_fkey FOREIGN KEY (chapter_id) REFERENCES public.chapters(id)
);
CREATE TABLE public.user_highlights (
  user_id uuid NOT NULL,
  token_id text NOT NULL,
  color text,
  status text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_highlights_pkey PRIMARY KEY (token_id, user_id),
  CONSTRAINT user_highlights_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_highlights_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id)
);
CREATE TABLE public.user_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  story_revision_id uuid NOT NULL,
  token_id text,
  segment_id uuid,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_notes_pkey PRIMARY KEY (id),
  CONSTRAINT user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_notes_story_revision_id_fkey FOREIGN KEY (story_revision_id) REFERENCES public.story_revisions(id),
  CONSTRAINT user_notes_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id),
  CONSTRAINT user_notes_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.segments(id)
);
CREATE TABLE public.user_story_progress (
  user_id uuid NOT NULL,
  story_id uuid NOT NULL,
  latest_revision_id uuid,
  last_chapter_id uuid,
  last_seg_index integer,
  last_tok_index integer,
  percent numeric,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_story_progress_pkey PRIMARY KEY (story_id, user_id),
  CONSTRAINT user_story_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_story_progress_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id),
  CONSTRAINT user_story_progress_latest_revision_id_fkey FOREIGN KEY (latest_revision_id) REFERENCES public.story_revisions(id),
  CONSTRAINT user_story_progress_last_chapter_id_fkey FOREIGN KEY (last_chapter_id) REFERENCES public.chapters(id)
);
CREATE TABLE public.user_token_translations (
  user_id uuid NOT NULL,
  token_id text NOT NULL,
  translation text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_token_translations_pkey PRIMARY KEY (token_id, user_id),
  CONSTRAINT user_token_translations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_token_translations_token_id_fkey FOREIGN KEY (token_id) REFERENCES public.tokens(id)
);
CREATE TABLE public.user_translations (
  user_id uuid NOT NULL,
  lemma_key text NOT NULL,
  translation text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_translations_pkey PRIMARY KEY (user_id, lemma_key),
  CONSTRAINT user_translations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_translations_lemma_key_fkey FOREIGN KEY (lemma_key) REFERENCES public.lexemes(lemma_key)
);
CREATE TABLE public.user_vocabulary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  romanian_word text NOT NULL,
  eng_translation text,
  known boolean DEFAULT false,
  first_learned_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_vocabulary_pkey PRIMARY KEY (id),
  CONSTRAINT user_vocabulary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.story_covers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT story_covers_pkey PRIMARY KEY (id),
  CONSTRAINT story_covers_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE,
  CONSTRAINT story_covers_story_id_is_primary_unique UNIQUE (story_id, is_primary) WHERE (is_primary = true)
);

CREATE TABLE public.word_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  document_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  original_word text NOT NULL DEFAULT ''::text,
  normalized_word text NOT NULL DEFAULT ''::text,
  language_code text NOT NULL DEFAULT 'ro'::text,
  context text,
  status text NOT NULL DEFAULT 'confirmed'::text CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'rejected'::text])),
  confidence_score double precision DEFAULT 1.0,
  translation text NOT NULL,
  occurrence_ids ARRAY NOT NULL DEFAULT '{}'::text[],
  context_left text,
  context_right text,
  CONSTRAINT word_translations_pkey PRIMARY KEY (id),
  CONSTRAINT word_translations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT word_translations_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id)
);


create table public.story_covers (
  id uuid not null default gen_random_uuid (),
  story_id uuid not null,
  storage_path text null,
  file_name text null,
  mime_type text null,
  width integer null,
  height integer null,
  cdn_url text null,
  is_primary boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint story_covers_pkey primary key (id),
  constraint story_covers_story_id_fkey foreign KEY (story_id) references stories (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists story_covers_primary_idx on public.story_covers using btree (story_id) TABLESPACE pg_default
where
  (is_primary = true);