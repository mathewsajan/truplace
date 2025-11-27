/*
  # Fix Database Security Issues

  ## Summary
  This migration addresses multiple security and performance issues identified by Supabase:

  ## Changes Made

  ### 1. Missing Foreign Key Indexes
  - Add index for `admin_users.created_by` foreign key
  - Add index for `companies.request_id` foreign key

  ### 2. RLS Policy Optimization
  - Update `reviews` policies to use `(SELECT auth.uid())` pattern
  - Update `admin_users` policies to use `(SELECT auth.uid())` pattern
  - Prevents re-evaluation of auth functions for each row

  ### 3. Remove Unused Indexes
  - Drop indexes that are not being used by queries
  - Reduces storage overhead and maintenance cost

  ### 4. Fix Security Definer View
  - Recreate `company_stats` view without SECURITY DEFINER
  - Uses SECURITY INVOKER instead (default, safer)

  ### 5. Fix Function Search Paths
  - Add explicit search_path to all functions
  - Prevents search path injection attacks

  ### 6. Move pg_trgm Extension
  - Move pg_trgm from public schema to extensions schema
  - Follows security best practices

  ## Security Impact
  - Improved query performance with optimized RLS policies
  - Better protection against search path injection
  - Reduced attack surface by removing SECURITY DEFINER
  - Extension isolation for better security
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index for admin_users.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_admin_users_created_by ON admin_users(created_by);

-- Index for companies.request_id foreign key
CREATE INDEX IF NOT EXISTS idx_companies_request_id ON companies(request_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES
-- =====================================================

-- Drop and recreate reviews policies with optimized auth checks
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Drop and recreate admin_users policies with optimized auth checks
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Super admins can insert admin users" ON admin_users;
CREATE POLICY "Super admins can insert admin users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = (SELECT auth.uid()) AND role = 'super_admin'
    )
  );

-- =====================================================
-- 3. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop unused indexes on notifications table
DROP INDEX IF EXISTS idx_notifications_token;
DROP INDEX IF EXISTS idx_notifications_recipient_hash;
DROP INDEX IF EXISTS idx_notifications_expires_at;

-- Drop unused indexes on admin_users table
DROP INDEX IF EXISTS idx_admin_users_user_id;
DROP INDEX IF EXISTS idx_admin_users_email;

-- Drop unused indexes on companies table
DROP INDEX IF EXISTS idx_companies_industry_name;
DROP INDEX IF EXISTS idx_companies_industry;

-- Drop unused indexes on reviews table
DROP INDEX IF EXISTS idx_reviews_user_id;
DROP INDEX IF EXISTS idx_reviews_recommendation;
DROP INDEX IF EXISTS idx_reviews_created_at;
DROP INDEX IF EXISTS idx_reviews_overall_rating;

-- Drop unused indexes on company_requests table
DROP INDEX IF EXISTS idx_company_requests_status;
DROP INDEX IF EXISTS idx_company_requests_created_at;
DROP INDEX IF EXISTS idx_company_requests_requester_hash;
DROP INDEX IF EXISTS idx_company_requests_requester_email;

-- =====================================================
-- 4. FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop and recreate view without SECURITY DEFINER (uses SECURITY INVOKER by default)
DROP VIEW IF EXISTS company_stats;
CREATE VIEW company_stats AS
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

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix update_company_updated_at function
CREATE OR REPLACE FUNCTION update_company_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE companies
  SET updated_at = now()
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$;

-- Fix get_current_quarter function
CREATE OR REPLACE FUNCTION get_current_quarter()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_quarter integer;
  current_year integer;
BEGIN
  current_quarter := EXTRACT(QUARTER FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  RETURN 'Q' || current_quarter || ' ' || current_year;
END;
$$;

-- Fix check_duplicate_companies function
CREATE OR REPLACE FUNCTION check_duplicate_companies(
  p_company_name text,
  p_website text
)
RETURNS TABLE(id uuid, name text, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    similarity(LOWER(c.name), LOWER(p_company_name)) as sim
  FROM companies c
  WHERE
    LOWER(c.name) LIKE '%' || LOWER(p_company_name) || '%'
    OR similarity(LOWER(c.name), LOWER(p_company_name)) > 0.5
  ORDER BY sim DESC
  LIMIT 5;
END;
$$;

-- Fix cleanup_expired_notifications function
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at < now() AND read = true;
END;
$$;

-- =====================================================
-- 6. MOVE PG_TRGM EXTENSION
-- =====================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Recreate check_duplicate_companies function to use pg_trgm from extensions schema
CREATE OR REPLACE FUNCTION check_duplicate_companies(
  p_company_name text,
  p_website text
)
RETURNS TABLE(id uuid, name text, similarity float)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    extensions.similarity(LOWER(c.name), LOWER(p_company_name)) as sim
  FROM companies c
  WHERE
    LOWER(c.name) LIKE '%' || LOWER(p_company_name) || '%'
    OR extensions.similarity(LOWER(c.name), LOWER(p_company_name)) > 0.5
  ORDER BY sim DESC
  LIMIT 5;
END;
$$;
