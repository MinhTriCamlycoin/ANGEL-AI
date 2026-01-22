-- Allow the app's Angel role value when inserting messages
DO $$
BEGIN
  -- Drop existing role check constraint if present
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'angel_messages_role_check'
  ) THEN
    ALTER TABLE public.angel_messages
      DROP CONSTRAINT angel_messages_role_check;
  END IF;

  -- Recreate constraint with allowed values used by the app
  ALTER TABLE public.angel_messages
    ADD CONSTRAINT angel_messages_role_check
    CHECK (role IN ('user','angel','assistant'));
END $$;