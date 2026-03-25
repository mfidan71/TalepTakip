
-- Fix permissive UPDATE policy on requests - allow creator or assigned user to update
DROP POLICY "Authenticated can update requests" ON public.requests;
CREATE POLICY "Team members can update requests" ON public.requests FOR UPDATE TO authenticated USING (auth.uid() = created_by OR auth.uid() = assigned_to OR assigned_to IS NULL);
