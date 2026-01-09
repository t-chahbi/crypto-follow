-- Migration: Add role management to profiles
-- Run this in Supabase SQL Editor

-- 1. Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. RLS Policy: seul l'admin peut update les roles
CREATE POLICY "Only admins can update user roles" 
ON public.profiles 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    )
);

-- 3. Création de la vue admin_dashboard
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
    p.id,
    p.username,
    p.role,
    p.balance,
    COUNT(DISTINCT t.id) as total_transactions,
    COUNT(DISTINCT a.id) as total_alerts
FROM public.profiles p
LEFT JOIN public.transactions t ON t.user_id = p.id
LEFT JOIN public.alerts a ON a.user_id = p.id
GROUP BY p.id, p.username, p.role, p.balance;

-- 4. L'admin peut voir le dashboard
CREATE POLICY "Admins can view dashboard" 
ON public.profiles 
FOR SELECT 
USING (
    role = 'admin' OR id = auth.uid()
);
