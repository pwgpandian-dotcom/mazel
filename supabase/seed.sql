-- ============================================================
-- Mazel Marketplace — Demo Seed Data
-- Run AFTER 001_initial.sql and 002_fixes.sql
-- ============================================================
-- TIP: Use the /setup page instead — it does all of this automatically!
-- Visit http://localhost:3000/setup after signing in.
-- ============================================================

-- STEP 1: Make a signed-up user the admin
-- Replace 'your@email.com' with the email you signed up with
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- Confirm it worked (should return 1 row with role = 'admin'):
-- SELECT id, full_name, email, role FROM profiles WHERE role = 'admin';

-- ============================================================
-- STEP 2: Sign up a SELLER account at http://localhost:3000/auth/signup
-- Then apply at http://localhost:3000/become-seller
-- Then run these to approve that seller:
-- ============================================================

-- Replace 'seller@email.com' with the seller's email
-- UPDATE profiles SET role = 'seller' WHERE email = 'seller@email.com';
-- UPDATE sellers SET status = 'approved'
--   WHERE id = (SELECT id FROM profiles WHERE email = 'seller@email.com');

-- ============================================================
-- STEP 3: Insert 2 demo products (needs at least one approved seller)
-- ============================================================

INSERT INTO products (seller_id, name, description, price, stock, category_id, images, status)
SELECT
  s.id,
  'Organic Turmeric Powder',
  'Pure organic turmeric powder from Tamil Nadu farms. Rich in curcumin — great for cooking and health. 100g pack.',
  299,
  50,
  (SELECT id FROM categories WHERE slug = 'groceries'),
  ARRAY['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400'],
  'active'
FROM sellers s
WHERE s.status = 'approved'
LIMIT 1;

INSERT INTO products (seller_id, name, description, price, stock, category_id, images, status)
SELECT
  s.id,
  'Handwoven Cotton Kurta',
  'Handcrafted cotton kurta with traditional block-print embroidery. Comfortable and elegant. Available in S/M/L/XL.',
  899,
  25,
  (SELECT id FROM categories WHERE slug = 'handmade'),
  ARRAY['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400'],
  'active'
FROM sellers s
WHERE s.status = 'approved'
LIMIT 1;

-- Verify products were added:
-- SELECT p.id, p.name, p.price, s.shop_name FROM products p JOIN sellers s ON s.id = p.seller_id;
