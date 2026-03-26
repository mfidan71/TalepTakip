
CREATE TABLE public.stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  color text NOT NULL DEFAULT '220 15% 50%',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stages viewable by authenticated" ON public.stages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can manage stages" ON public.stages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.stages (key, label, color, sort_order) VALUES
  ('talep', 'Talep', '262 80% 55%', 0),
  ('degerlendirme', 'Değerlendirme', '210 70% 55%', 1),
  ('planlama', 'Planlama', '35 80% 55%', 2),
  ('gelistirme', 'Geliştirme', '170 65% 42%', 3),
  ('test', 'Test', '280 60% 55%', 4),
  ('canli', 'Canlı', '145 65% 42%', 5);
