-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create angel_conversations table
CREATE TABLE public.angel_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create angel_messages table
CREATE TABLE public.angel_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.angel_conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    media_type TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.angel_messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reaction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (message_id, user_id, reaction)
);

-- Create divine_knowledge table for admin content
CREATE TABLE public.divine_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angel_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.angel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divine_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for angel_conversations
CREATE POLICY "Users can view their own conversations"
ON public.angel_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.angel_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.angel_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.angel_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for angel_messages
CREATE POLICY "Users can view messages in their conversations"
ON public.angel_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.angel_conversations
        WHERE id = conversation_id AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can create messages in their conversations"
ON public.angel_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.angel_conversations
        WHERE id = conversation_id AND user_id = auth.uid()
    )
);

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions on their messages"
ON public.message_reactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.angel_messages m
        JOIN public.angel_conversations c ON m.conversation_id = c.id
        WHERE m.id = message_id AND c.user_id = auth.uid()
    )
);

CREATE POLICY "Users can add reactions"
ON public.message_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for divine_knowledge (admins only for write, everyone can read)
CREATE POLICY "Anyone can view divine knowledge"
ON public.divine_knowledge FOR SELECT
USING (true);

CREATE POLICY "Admins can insert divine knowledge"
ON public.divine_knowledge FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update divine knowledge"
ON public.divine_knowledge FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete divine knowledge"
ON public.divine_knowledge FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_angel_conversations_updated_at
BEFORE UPDATE ON public.angel_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divine_knowledge_updated_at
BEFORE UPDATE ON public.divine_knowledge
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();