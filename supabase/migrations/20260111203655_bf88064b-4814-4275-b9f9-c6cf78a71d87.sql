-- Create profiles table for user management (both buyers and vendors)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles can be read by anyone authenticated
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update vendor_invitations to allow vendors to see their invitations
DROP POLICY IF EXISTS "Allow all access to vendor_invitations" ON public.vendor_invitations;

CREATE POLICY "Anyone can view invitations" 
ON public.vendor_invitations 
FOR SELECT 
USING (true);

CREATE POLICY "Buyers can create invitations" 
ON public.vendor_invitations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Vendors can update their invitations" 
ON public.vendor_invitations 
FOR UPDATE 
USING (true);

-- Update quotes RLS to allow vendors to insert their own quotes
DROP POLICY IF EXISTS "Allow all access to quotes" ON public.quotes;

CREATE POLICY "Anyone can view quotes" 
ON public.quotes 
FOR SELECT 
USING (true);

CREATE POLICY "Vendors can insert quotes" 
ON public.quotes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Vendors can update their quotes" 
ON public.quotes 
FOR UPDATE 
USING (true);