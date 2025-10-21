-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create soulbound_tokens table
CREATE TABLE public.soulbound_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_address text NOT NULL,
  token_id text,
  token_type text NOT NULL CHECK (token_type IN ('credential', 'membership', 'achievement')),
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  hedera_token_id text,
  is_revoked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.soulbound_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for soulbound_tokens
CREATE POLICY "Users can view their issued tokens"
  ON public.soulbound_tokens FOR SELECT
  USING (auth.uid() = issuer_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.soulbound_tokens FOR INSERT
  WITH CHECK (auth.uid() = issuer_id);

CREATE POLICY "Users can update their own tokens"
  ON public.soulbound_tokens FOR UPDATE
  USING (auth.uid() = issuer_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_soulbound_tokens_updated_at
  BEFORE UPDATE ON public.soulbound_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();