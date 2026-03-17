CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  article_no      VARCHAR(32) NOT NULL UNIQUE,
  product_service VARCHAR(255) NOT NULL,
  in_price        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  price           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  unit            VARCHAR(32) NOT NULL DEFAULT '',
  in_stock        INTEGER,
  description     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_article_no ON products (article_no);
