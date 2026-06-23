-- ============================================================
-- Mazel Marketplace — Migration 002: Fixes & Improvements
-- Paste into Supabase SQL Editor and Run
-- ============================================================

-- 1. Add email column to profiles (so admin can see seller emails)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update trigger to also save email on new signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    'buyer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill email for existing users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 4. Allow public to read approved sellers (needed for homepage product listings)
--    Without this, shop_name won't show on product cards for public users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'sellers' AND policyname = 'sellers: public read approved'
  ) THEN
    EXECUTE 'CREATE POLICY "sellers: public read approved" ON sellers FOR SELECT USING (status = ''approved'')';
  END IF;
END $$;

-- 5. Allow all sellers (even pending) to insert products
--    Products from pending sellers won't show publicly (shop_name hidden by RLS)
--    but sellers can set up their catalog while waiting for approval
DROP POLICY IF EXISTS "products: seller insert" ON products;
CREATE POLICY "products: seller insert" ON products
  FOR INSERT WITH CHECK (
    seller_id = auth.uid()
    AND EXISTS (SELECT 1 FROM sellers WHERE id = auth.uid())
  );
