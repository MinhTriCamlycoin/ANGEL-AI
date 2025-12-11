-- Create angel_conversations table
CREATE TABLE public.angel_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Cuộc trò chuyện mới ✨',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create angel_messages table
CREATE TABLE public.angel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.angel_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'angel')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.angel_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angel_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for angel_conversations (users can only access their own)
CREATE POLICY "users_own_conversations" ON public.angel_conversations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for angel_messages (users can only access messages in their conversations)
CREATE POLICY "users_own_messages" ON public.angel_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.angel_conversations 
      WHERE id = angel_messages.conversation_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.angel_conversations 
      WHERE id = angel_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at on conversations
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.angel_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON public.angel_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_timestamp();