-- Migration: Allow anon (unauthenticated visitors) to read active plans
-- Fixes issue where meal plan cards and prices were not visible on https://momskitchen.co.in/

DROP POLICY IF EXISTS "plans_authenticated_select" ON public.plans;
DROP POLICY IF EXISTS "public_read_plans" ON public.plans;

CREATE POLICY "public_read_plans" ON public.plans
  FOR SELECT
  TO anon, authenticated
  USING (true);
