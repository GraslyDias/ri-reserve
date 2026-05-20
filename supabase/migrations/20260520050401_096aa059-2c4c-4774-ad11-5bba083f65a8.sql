
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

DROP POLICY "Anyone creates inquiry" ON public.inquiries;
CREATE POLICY "Public can create inquiry" ON public.inquiries FOR INSERT
WITH CHECK (
  length(customer_name) > 0 AND length(customer_name) <= 200
  AND length(phone) BETWEEN 5 AND 30
  AND length(package_name) > 0
  AND preferred_date >= CURRENT_DATE
);
