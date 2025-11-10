-- Fix functions missing search_path parameter for security
-- This prevents potential schema manipulation attacks

-- Fix initialize_onboarding_checklist function
ALTER FUNCTION public.initialize_onboarding_checklist(uuid) 
SET search_path = public;

-- Fix trigger_initialize_onboarding function  
ALTER FUNCTION public.trigger_initialize_onboarding() 
SET search_path = public;

-- Fix log_marketing_event function
ALTER FUNCTION public.log_marketing_event(uuid, uuid, text, jsonb) 
SET search_path = public;

-- Fix update_help_articles_updated_at function
ALTER FUNCTION public.update_help_articles_updated_at() 
SET search_path = public;