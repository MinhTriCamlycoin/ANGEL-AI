-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.angel_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL CHECK (emoji IN ('❤️', '✨', '🙏', '😊')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view all reactions on messages in their conversations
CREATE POLICY "users_view_reactions" ON public.message_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM angel_messages m
    JOIN angel_conversations c ON c.id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND c.user_id = auth.uid()
  )
);

-- Users can add reactions to messages in their conversations
CREATE POLICY "users_add_reactions" ON public.message_reactions
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM angel_messages m
    JOIN angel_conversations c ON c.id = m.conversation_id
    WHERE m.id = message_reactions.message_id AND c.user_id = auth.uid()
  )
);

-- Users can delete their own reactions
CREATE POLICY "users_delete_own_reactions" ON public.message_reactions
FOR DELETE USING (auth.uid() = user_id);