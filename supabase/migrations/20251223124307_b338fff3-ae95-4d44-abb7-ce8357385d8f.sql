-- Add explicit DENY policies for UPDATE and DELETE on cargo_api_logs
-- This ensures audit logs cannot be modified or deleted by users, only by service role

-- Create a policy that denies all UPDATE operations for authenticated users
CREATE POLICY "Deny all updates to cargo logs"
ON public.cargo_api_logs
FOR UPDATE
TO authenticated
USING (false);

-- Create a policy that denies all DELETE operations for authenticated users
CREATE POLICY "Deny all deletes to cargo logs"
ON public.cargo_api_logs
FOR DELETE
TO authenticated
USING (false);