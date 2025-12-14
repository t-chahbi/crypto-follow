-- Migration: Add wallet balance and update transactions table
-- Run this in your Supabase SQL Editor

-- 1. Add balance column to profiles (default $10,000 for demo)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS balance numeric DEFAULT 10000;

-- 2. Add total_cost column to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS total_cost numeric;

-- 3. Update transaction type constraint to include DEPOSIT/WITHDRAW
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('BUY', 'SELL', 'DEPOSIT', 'WITHDRAW'));

-- 4. Make price_per_coin nullable (for DEPOSIT/WITHDRAW transactions)
ALTER TABLE public.transactions 
ALTER COLUMN price_per_coin DROP NOT NULL;

-- 5. Allow authenticated users to update their own profile balance
CREATE POLICY IF NOT EXISTS "Users can update own profile balance." 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Allow authenticated users to insert crypto_assets
CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert crypto_assets" 
ON public.crypto_assets 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 7. Update existing transactions to have total_cost
UPDATE public.transactions 
SET total_cost = amount * price_per_coin 
WHERE total_cost IS NULL AND price_per_coin IS NOT NULL;
