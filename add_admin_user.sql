-- =============================================================================
-- ADD ADMIN USER TO TRUPLACE
-- =============================================================================
-- This script adds a new admin user to the admin_users table.
--
-- INSTRUCTIONS:
-- 1. First, ensure the user exists in Supabase Authentication
--    - Go to: Supabase Dashboard > Authentication > Users
--    - Create user if needed, or find existing user
--    - Copy the User ID (UUID)
--
-- 2. Replace the placeholders below with actual values:
--    - YOUR_USER_UUID_HERE: The UUID from Authentication > Users
--    - admin@example.com: The email address of the admin user
--
-- 3. Run this script in Supabase SQL Editor:
--    - Go to: Supabase Dashboard > SQL Editor
--    - Create new query
--    - Paste this script with your values
--    - Click "Run"
--
-- ROLES:
-- - 'super_admin': Full admin access, can manage other admins
-- - 'admin': Standard admin access (for future role-based restrictions)
-- =============================================================================

-- Add a new admin user
INSERT INTO admin_users (user_id, email, role)
VALUES (
  'YOUR_USER_UUID_HERE',  -- Replace with actual UUID from auth.users
  'admin@example.com',    -- Replace with actual admin email
  'super_admin'           -- Use 'super_admin' or 'admin'
);

-- =============================================================================
-- VERIFICATION
-- =============================================================================
-- After running the above, verify the admin was added:

SELECT
  au.id,
  au.user_id,
  au.email,
  au.role,
  au.created_at,
  u.email as auth_email
FROM admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. The user_id MUST match an existing user in auth.users table
-- 2. Each user_id can only be added once (unique constraint)
-- 3. Admins can only be added by existing super_admin users (via RLS policies)
-- 4. To remove an admin, delete their row from admin_users table
-- =============================================================================
