/*
  # Update Rating Dimensions to Include Business Health & Outlook

  1. Changes
    - Update company_stats view to include 9th dimension: business_health
    - Add COALESCE for backward compatibility with existing reviews
    - All existing reviews without business_health will default to 0

  2. Security
    - No changes to RLS policies
    - View remains publicly readable
*/

-- Drop and recreate the company_stats view with 9 dimensions
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
      'compensation', ROUND(AVG(COALESCE((r.dimensions->>'compensation')::float, 0))::numeric, 1),
      'management', ROUND(AVG(COALESCE((r.dimensions->>'management')::float, 0))::numeric, 1),
      'culture', ROUND(AVG(COALESCE((r.dimensions->>'culture')::float, 0))::numeric, 1),
      'career', ROUND(AVG(COALESCE((r.dimensions->>'career')::float, 0))::numeric, 1),
      'recognition', ROUND(AVG(COALESCE((r.dimensions->>'recognition')::float, 0))::numeric, 1),
      'environment', ROUND(AVG(COALESCE((r.dimensions->>'environment')::float, 0))::numeric, 1),
      'worklife', ROUND(AVG(COALESCE((r.dimensions->>'worklife')::float, 0))::numeric, 1),
      'cooperation', ROUND(AVG(COALESCE((r.dimensions->>'cooperation')::float, 0))::numeric, 1),
      'business_health', ROUND(AVG(COALESCE((r.dimensions->>'business_health')::float, 0))::numeric, 1)
    ),
    '{}'::jsonb
  ) as dimensions,
  c.created_at,
  c.updated_at
FROM companies c
LEFT JOIN reviews r ON c.id = r.company_id
GROUP BY c.id, c.name, c.industry, c.size, c.logo_url, c.created_at, c.updated_at;