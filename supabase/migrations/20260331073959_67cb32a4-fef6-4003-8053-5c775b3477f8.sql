
-- Create boards table
CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Boards viewable by authenticated" ON public.boards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can create boards" ON public.boards
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update boards" ON public.boards
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete boards" ON public.boards
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Add board_id to requests
ALTER TABLE public.requests ADD COLUMN board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE;

-- Add board_id to stages
ALTER TABLE public.stages ADD COLUMN board_id uuid REFERENCES public.boards(id) ON DELETE CASCADE;
