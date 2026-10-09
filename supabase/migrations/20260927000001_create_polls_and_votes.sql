-- Migration: Create Polls, Poll Votes, and Poll OTPs tables
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_customer_poll_vote UNIQUE (poll_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.poll_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_poll_otps_phone_expires ON public.poll_otps (phone, expires_at);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON public.poll_votes (poll_id);

-- Row-Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_otps ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "service_role_polls" ON public.polls
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "service_role_poll_votes" ON public.poll_votes
    FOR ALL TO service_role
    USING (true);

CREATE POLICY "service_role_poll_otps" ON public.poll_otps
    FOR ALL TO service_role
    USING (true);

-- Admin full access
CREATE POLICY "admin_full_polls" ON public.polls
    FOR ALL TO authenticated
    USING (is_admin());

CREATE POLICY "admin_full_poll_votes" ON public.poll_votes
    FOR ALL TO authenticated
    USING (is_admin());

-- Public read access to active and closed polls (draft polls remain admin-only)
CREATE POLICY "public_read_polls" ON public.polls
    FOR SELECT TO anon, authenticated
    USING (status IN ('active', 'closed'));

-- Public read access to poll votes for results transparency
CREATE POLICY "public_read_poll_votes" ON public.poll_votes
    FOR SELECT TO anon, authenticated
    USING (true);

-- Updated_at trigger for polls
DROP TRIGGER IF EXISTS tr_polls_updated_at ON public.polls;
CREATE TRIGGER tr_polls_updated_at
    BEFORE UPDATE ON public.polls
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_update_updated_at();

-- Seed initial sample active poll if no active poll exists
INSERT INTO public.polls (title, description, options, status, closes_at)
SELECT
  'What special dish should we cook for Friday Lunch?',
  'Vote for your favorite weekend comfort meal! The winning dish will be freshly made for all active subscribers.',
  '[
    {"id": "opt_1", "label": "Shahi Paneer with Butter Naan & Jeera Rice"},
    {"id": "opt_2", "label": "Dal Makhani with Laccha Paratha & Pulao"},
    {"id": "opt_3", "label": "Amritsari Chole Kulche with Mint Chutney & Salad"}
  ]'::jsonb,
  'active',
  now() + interval '7 days'
WHERE NOT EXISTS (SELECT 1 FROM public.polls WHERE status = 'active');
