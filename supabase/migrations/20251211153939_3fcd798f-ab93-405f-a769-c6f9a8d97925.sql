-- Fix 1: Drop overly permissive policy on light_users and create proper owner-only policy
DROP POLICY IF EXISTS user_own_data ON public.light_users;

CREATE POLICY users_own_data ON public.light_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix 2: Create proper RLS policies for angel_interactions (private conversations)
CREATE POLICY users_own_interactions ON public.angel_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix 3: Create proper RLS policies for light_transactions (financial data)
CREATE POLICY users_own_transactions ON public.light_transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix 4: Create public read policy for divine_mantras (reference data meant to be public)
CREATE POLICY anyone_can_read_mantras ON public.divine_mantras
  FOR SELECT
  TO public
  USING (true);