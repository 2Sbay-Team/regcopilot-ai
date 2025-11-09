-- Add currency and language preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en', 'fr', 'de', 'ar'));