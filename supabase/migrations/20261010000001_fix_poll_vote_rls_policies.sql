-- Migration: Fix and streamline RLS policies for polls, poll_votes, and poll_otps
-- Allows public/anon reading of active and closed polls, public reading of votes,
-- and public insertion of votes for active polls.

-- 1. Clean up polls policies
DROP POLICY IF EXISTS "Public read active polls" ON public.polls;
DROP POLICY IF EXISTS "public_read_polls" ON public.polls;
CREATE POLICY "public_read_polls" ON public.polls
    FOR SELECT TO anon, authenticated
    USING (status IN ('active', 'closed'));

-- 2. Clean up poll_votes policies
DROP POLICY IF EXISTS "Public read poll votes" ON public.poll_votes;
DROP POLICY IF EXISTS "public_read_poll_votes" ON public.poll_votes;
CREATE POLICY "public_read_poll_votes" ON public.poll_votes
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow inserting votes for active polls
DROP POLICY IF EXISTS "public_insert_poll_votes" ON public.poll_votes;
CREATE POLICY "public_insert_poll_votes" ON public.poll_votes
    FOR INSERT TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls
            WHERE polls.id = poll_votes.poll_id
              AND polls.status = 'active'
        )
    );

-- 3. Clean up poll_otps policies (allow verification workflows)
DROP POLICY IF EXISTS "public_all_poll_otps" ON public.poll_otps;
CREATE POLICY "public_all_poll_otps" ON public.poll_otps
    FOR ALL TO anon, authenticated
    USING (true)
    WITH CHECK (true);
