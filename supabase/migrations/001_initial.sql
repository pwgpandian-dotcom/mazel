-- ============================================================
-- Mazel Marketplace — Initial Schema + RLS
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Helper: check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper: check if current user is an approved seller
CREATE OR REPLACE FUNCTION is_approved_seller()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM sellers WHERE id = auth.uid() AND status = 'approved'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  role        TEXT DEFAULT 'buyer' CHECK (role IN ('buyer','seller','admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sellers (
  id            UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  shop_name     TEXT NOT NULL,
  shop_address  TEXT,
  gst_number    TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL,
  slug  TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  seller_id    UUID REFERENCES sellers(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  stock        INT DEFAULT 0,
  category_id  BIGINT REFERENCES categories(id),
  images       TEXT[] DEFAULT '{}',
  status       TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  buyer_id             UUID REFERENCES profiles(id),
  total_amount         NUMERIC(10,2) NOT NULL,
  platform_commission  NUMERIC(10,2) DEFAULT 0,
  payment_method       TEXT CHECK (payment_method IN ('online','cod')),
  payment_status       TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  order_status         TEXT DEFAULT 'placed' CHECK (order_status IN ('placed','shipped','delivered','cancelled')),
  shipping_name        TEXT NOT NULL,
  shipping_phone       TEXT NOT NULL,
  shipping_address     TEXT NOT NULL,
  razorpay_order_id    TEXT,
  razorpay_payment_id  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        BIGINT REFERENCES orders(id) ON DELETE CASCADE,
  product_id      BIGINT REFERENCES products(id),
  seller_id       UUID REFERENCES sellers(id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  price_at_order  NUMERIC(10,2) NOT NULL,
  item_status     TEXT DEFAULT 'placed' CHECK (item_status IN ('placed','shipped','delivered'))
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_seller   ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'buyer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles: own read"   ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles: own insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: own update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- sellers
CREATE POLICY "sellers: own read"    ON sellers FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "sellers: own insert"  ON sellers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "sellers: own update"  ON sellers FOR UPDATE USING (auth.uid() = id OR is_admin());

-- categories — public read, admin write
CREATE POLICY "categories: public read"    ON categories FOR SELECT USING (true);
CREATE POLICY "categories: admin insert"   ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories: admin update"   ON categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories: admin delete"   ON categories FOR DELETE USING (is_admin());

-- products — public read active, seller writes own
CREATE POLICY "products: public read" ON products
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR is_admin());

CREATE POLICY "products: seller insert" ON products
  FOR INSERT WITH CHECK (seller_id = auth.uid() AND is_approved_seller());

CREATE POLICY "products: seller update" ON products
  FOR UPDATE USING (seller_id = auth.uid() OR is_admin());

CREATE POLICY "products: seller delete" ON products
  FOR DELETE USING (seller_id = auth.uid() OR is_admin());

-- orders — buyer reads own, buyer inserts own, admin full
CREATE POLICY "orders: buyer read"   ON orders FOR SELECT USING (buyer_id = auth.uid() OR is_admin());
CREATE POLICY "orders: buyer insert" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "orders: admin update" ON orders FOR UPDATE USING (is_admin());

-- order_items — buyer via order, seller via seller_id, admin all
CREATE POLICY "order_items: read" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
    OR seller_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "order_items: insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND buyer_id = auth.uid())
  );

CREATE POLICY "order_items: seller update" ON order_items
  FOR UPDATE USING (seller_id = auth.uid() OR is_admin());

-- ============================================================
-- SEED: default categories
-- ============================================================

INSERT INTO categories (name, slug) VALUES
  ('Groceries',    'groceries'),
  ('Clothing',     'clothing'),
  ('Electronics',  'electronics'),
  ('Home',         'home'),
  ('Beauty',       'beauty'),
  ('Handmade',     'handmade')
ON CONFLICT (slug) DO NOTHING;
