/*
  # Fix Remaining Security Issues

  ## Summary
  This migration addresses the remaining security issues identified by Supabase.

  ## Changes Made

  ### 1. Remove Unused Indexes
  - Drop `idx_admin_users_created_by` - not being used by queries
  - Drop `idx_companies_request_id` - not being used by queries

  ### 2. Fix Multiple Permissive Policies on Reviews
  - Remove conflicting "Anyone can insert reviews" policy for public role
  - Keep only "Authenticated users can insert reviews" policy
  - This ensures only authenticated users can create reviews

  ### 3. Fix Security Definer View
  - Recreate `company_stats` view with explicit SECURITY INVOKER
  - This is the safer default that uses the calling user's permissions

  ## Security Impact
  - Reduced storage overhead by removing unused indexes
  - Fixed policy conflict on reviews table
  - Improved security by using SECURITY INVOKER for views
  - Reviews now properly require authentication to create
*/

-- =====================================================
-- 1. REMOVE UNUSED INDEXES
-- =====================================================

-- Drop the newly created but unused indexes
DROP INDEX IF EXISTS idx_admin_users_created_by;
DROP INDEX IF EXISTS idx_companies_request_id;

-- =====================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES ON REVIEWS
-- =====================================================

-- Remove the conflicting "Anyone can insert reviews" policy
-- This might exist from an old migration or manual creation
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;

-- Ensure we have the correct authenticated-only policy
-- (it should already exist from previous migration, but we'll make sure)
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 3. FIX SECURITY DEFINER VIEW
-- =====================================================

-- Drop and recreate view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS company_stats;
CREATE VIEW company_stats 
WITH (security_invoker = true) AS
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
