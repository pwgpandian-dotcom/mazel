-- ============================================================
-- Mazel Marketplace — Product Reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id     BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name  TEXT NOT NULL DEFAULT 'Anonymous',
  rating         INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, buyer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "reviews: public read" ON reviews FOR SELECT USING (true);

-- Buyers who have a delivered order item for this product can insert
CREATE OR REPLACE FUNCTION has_delivered_item(p_id BIGINT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.product_id = p_id
      AND o.buyer_id = auth.uid()
      AND o.order_status = 'delivered'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE POLICY "reviews: buyer insert" ON reviews
  FOR INSERT WITH CHECK (
    buyer_id = auth.uid()
    AND has_delivered_item(product_id)
  );

CREATE POLICY "reviews: buyer update" ON reviews
  FOR UPDATE USING (buyer_id = auth.uid());

CREATE POLICY "reviews: buyer delete" ON reviews
  FOR DELETE USING (buyer_id = auth.uid());
