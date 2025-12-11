-- Fix: Create proper RLS policies for repentance_gratitude_log (spiritual activity data)
CREATE POLICY users_own_log ON public.repentance_gratitude_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);