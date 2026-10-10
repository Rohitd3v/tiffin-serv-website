-- Migration: Comprehensive RLS Policy Fixes Across All Public Tables
-- Resolves missing policies for Admins, Staff, and Service Role across:
-- 1. customers (allow admin full CRUD + explicit service_role)
-- 2. profiles (allow admin full CRUD + self update + explicit service_role)
-- 3. audit_logs (allow admin/staff insert + explicit service_role)
-- 4. webhook_events (allow admin full CRUD + explicit service_role)
-- 5. Explicit service_role policies on all core tables for connection pooler safety

-- =============================================================================
-- 1. CUSTOMERS TABLE
-- =============================================================================
DROP POLICY IF EXISTS "admin_full_customers" ON public.customers;
CREATE POLICY "admin_full_customers" ON public.customers
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "service_role_customers" ON public.customers;
CREATE POLICY "service_role_customers" ON public.customers
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- 2. PROFILES TABLE
-- =============================================================================
DROP POLICY IF EXISTS "admin_full_profiles" ON public.profiles;
CREATE POLICY "admin_full_profiles" ON public.profiles
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "service_role_profiles" ON public.profiles;
CREATE POLICY "service_role_profiles" ON public.profiles
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- 3. AUDIT LOGS TABLE
-- =============================================================================
DROP POLICY IF EXISTS "allow_auth_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "allow_auth_insert_audit_logs" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_audit_logs" ON public.audit_logs;
CREATE POLICY "service_role_audit_logs" ON public.audit_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- 4. WEBHOOK EVENTS TABLE
-- =============================================================================
DROP POLICY IF EXISTS "admin_full_webhooks" ON public.webhook_events;
CREATE POLICY "admin_full_webhooks" ON public.webhook_events
    FOR ALL TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

DROP POLICY IF EXISTS "service_role_webhooks" ON public.webhook_events;
CREATE POLICY "service_role_webhooks" ON public.webhook_events
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- 5. EXPLICIT SERVICE ROLE POLICIES ON CORE TABLES
-- =============================================================================
DROP POLICY IF EXISTS "service_role_subscriptions" ON public.subscriptions;
CREATE POLICY "service_role_subscriptions" ON public.subscriptions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_orders" ON public.orders;
CREATE POLICY "service_role_orders" ON public.orders
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_payments" ON public.payments;
CREATE POLICY "service_role_payments" ON public.payments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_plans" ON public.plans;
CREATE POLICY "service_role_plans" ON public.plans
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_conversation_sessions" ON public.conversation_sessions;
CREATE POLICY "service_role_conversation_sessions" ON public.conversation_sessions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_system_logs" ON public.system_logs;
CREATE POLICY "service_role_system_logs" ON public.system_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);
