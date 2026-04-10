
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text,
  events text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Webhooks viewable by authenticated"
  ON public.webhooks FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Board creator can insert webhooks"
  ON public.webhooks FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND created_by = auth.uid())
  );

CREATE POLICY "Board creator can update webhooks"
  ON public.webhooks FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND created_by = auth.uid())
  );

CREATE POLICY "Board creator can delete webhooks"
  ON public.webhooks FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.boards WHERE id = board_id AND created_by = auth.uid())
  );

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
