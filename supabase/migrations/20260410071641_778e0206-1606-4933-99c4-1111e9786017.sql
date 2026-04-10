ALTER TABLE public.stages DROP CONSTRAINT IF EXISTS stages_key_key;
ALTER TABLE public.stages ADD CONSTRAINT stages_board_id_key_unique UNIQUE (board_id, key);