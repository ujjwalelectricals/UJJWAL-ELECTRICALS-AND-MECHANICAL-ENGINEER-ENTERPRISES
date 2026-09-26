CREATE TABLE categories(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,slug TEXT NOT NULL UNIQUE);
CREATE TABLE brands(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,slug TEXT NOT NULL UNIQUE);
CREATE TABLE products(id TEXT PRIMARY KEY,sku TEXT NOT NULL UNIQUE,name TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,category_id TEXT REFERENCES categories(id),brand_id TEXT REFERENCES brands(id),description TEXT NOT NULL,featured BOOLEAN NOT NULL DEFAULT FALSE,stock_status TEXT NOT NULL,image_label TEXT NOT NULL,specs JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX products_specs_gin_idx ON products USING GIN(specs);
CREATE TABLE enquiries(id UUID PRIMARY KEY,enquiry_number TEXT NOT NULL UNIQUE,name TEXT NOT NULL,company TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,city TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'New',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE enquiry_items(id BIGSERIAL PRIMARY KEY,enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,product_id TEXT NOT NULL REFERENCES products(id),quantity INTEGER NOT NULL CHECK(quantity>0),notes TEXT NOT NULL DEFAULT '');
CREATE INDEX enquiry_items_enquiry_idx ON enquiry_items(enquiry_id);