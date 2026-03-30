
CREATE TABLE public.request_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);

ALTER TABLE public.request_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by authenticated" ON public.request_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own votes" ON public.request_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.request_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
