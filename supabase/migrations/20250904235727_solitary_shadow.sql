/*
  # Create companies and reviews schema

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `industry` (text)
      - `size` (text)
      - `logo_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `reviews`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `overall_rating` (integer, 1-5)
      - `recommendation` (text)
      - `role` (text, optional)
      - `period` (text)
      - `pros` (text array)
      - `cons` (text array)
      - `advice` (text, optional)
      - `dimensions` (jsonb for 8 rating dimensions)
      - `helpful_count` (integer, default 0)
      - `created_at` (timestamp)
    - `company_stats`
      - Materialized view for aggregated company statistics

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Reviews are anonymous but tied to authenticated users
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  industry text NOT NULL,
  size text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
  recommendation text CHECK (recommendation IN ('highly-recommend', 'maybe', 'not-recommended')) NOT NULL,
  role text,
  period text DEFAULT 'Q4 2024',
  pros text[] DEFAULT '{}',
  cons text[] DEFAULT '{}',
  advice text,
  dimensions jsonb NOT NULL DEFAULT '{}',
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_overall_rating ON reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Companies policies (public read, authenticated write)
CREATE POLICY "Companies are viewable by everyone"
  ON companies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (true);

-- Reviews policies (public read for anonymity, authenticated write)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample companies
INSERT INTO companies (name, industry, size) VALUES
  ('Google', 'Technology', '1000+ employees'),
  ('Apple', 'Technology', '1000+ employees'),
  ('Amazon', 'E-commerce', '1000+ employees'),
  ('Microsoft', 'Technology', '1000+ employees'),
  ('Meta', 'Technology', '1000+ employees'),
  ('Netflix', 'Entertainment', '1000+ employees'),
  ('Tesla', 'Automotive', '1000+ employees'),
  ('Goldman Sachs', 'Finance', '1000+ employees'),
  ('JPMorgan Chase', 'Finance', '1000+ employees'),
  ('Johnson & Johnson', 'Healthcare', '1000+ employees')
ON CONFLICT (name) DO NOTHING;

-- Create a view for company statistics
CREATE OR REPLACE VIEW company_stats AS
SELECT 
  c.id,
  c.name,
  c.industry,
  c.size,
  c.logo_url,
  COALESCE(ROUND(AVG(r.overall_rating)::numeric, 1), 0) as overall_rating,
  COUNT(r.id) as review_count,
  COALESCE(
    ROUND(
      (COUNT(CASE WHEN r.recommendation = 'highly-recommend' THEN 1 END)::float / 
       NULLIF(COUNT(r.id), 0) * 100)::numeric, 0
    ), 0
  ) as recommendation_rate,
  COALESCE(
    jsonb_build_object(
      'compensation', ROUND(AVG((r.dimensions->>'compensation')::float)::numeric, 1),
      'management', ROUND(AVG((r.dimensions->>'management')::float)::numeric, 1),
      'culture', ROUND(AVG((r.dimensions->>'culture')::float)::numeric, 1),
      'career', ROUND(AVG((r.dimensions->>'career')::float)::numeric, 1),
      'recognition', ROUND(AVG((r.dimensions->>'recognition')::float)::numeric, 1),
      'environment', ROUND(AVG((r.dimensions->>'environment')::float)::numeric, 1),
      'worklife', ROUND(AVG((r.dimensions->>'worklife')::float)::numeric, 1),
      'cooperation', ROUND(AVG((r.dimensions->>'cooperation')::float)::numeric, 1)
    ),
    '{}'::jsonb
  ) as dimensions,
  c.created_at,
  c.updated_at
FROM companies c
LEFT JOIN reviews r ON c.id = r.company_id
GROUP BY c.id, c.name, c.industry, c.size, c.logo_url, c.created_at, c.updated_at;