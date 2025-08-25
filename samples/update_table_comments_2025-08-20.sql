-- Update table comments for clarity of purpose
COMMENT ON TABLE public.user_token_translations IS 'User-provided translation for a specific token in context';

-- Ensure vocabulary table describes known status behavior
COMMENT ON TABLE public.user_vocabulary IS 'Simple per-user vocabulary list, with optional status for "known" words';
