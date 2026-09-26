import{Pool}from"pg";import type{QueryResultRow}from"pg";import dotenv from"dotenv";dotenv.config();
export const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,max:10}):null;
export const databaseEnabled=Boolean(pool);
export async function query<T extends QueryResultRow=QueryResultRow>(text:string,params?:unknown[]){if(!pool)throw new Error("DATABASE_URL is not configured");return pool.query<T>(text,params)}
export async function ensureDatabase(){if(!pool)return;await pool.query(`
CREATE TABLE IF NOT EXISTS categories(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,slug TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS brands(id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,slug TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,sku TEXT NOT NULL UNIQUE,name TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,category_id TEXT REFERENCES categories(id),brand_id TEXT REFERENCES brands(id),description TEXT NOT NULL,featured BOOLEAN NOT NULL DEFAULT FALSE,stock_status TEXT NOT NULL,image_label TEXT NOT NULL,specs JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_specs_gin_idx ON products USING GIN(specs);
CREATE TABLE IF NOT EXISTS enquiries(id UUID PRIMARY KEY, enquiry_number TEXT NOT NULL UNIQUE,name TEXT NOT NULL,company TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL,city TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'New',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS enquiry_items(id BIGSERIAL PRIMARY KEY,enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,product_id TEXT NOT NULL REFERENCES products(id),quantity INTEGER NOT NULL CHECK(quantity>0),notes TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS enquiry_items_enquiry_idx ON enquiry_items(enquiry_id);
`)}
