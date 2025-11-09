-- Add RLS policy to allow service role to insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Add RLS policy to allow service role to update audit logs
CREATE POLICY "Service role can update audit logs"
ON public.audit_logs
FOR UPDATE
TO service_role
USING (true);