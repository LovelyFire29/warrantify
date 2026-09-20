DROP POLICY "own warranties" ON public.warranties;
DROP POLICY "own documents" ON public.documents;
DROP POLICY "own service history" ON public.service_history;
DROP POLICY "own claims" ON public.claims;
DROP FUNCTION public.owns_device(UUID);

CREATE POLICY "own warranties" ON public.warranties FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE POLICY "own documents" ON public.documents FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE POLICY "own service history" ON public.service_history FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));

CREATE POLICY "own claims" ON public.claims FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.user_id = auth.uid()));