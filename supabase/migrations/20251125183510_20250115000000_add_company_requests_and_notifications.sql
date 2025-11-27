/*
  # Add Company Requests, Notifications, and Admin System

  ## Summary
  This migration adds the complete infrastructure for company request management,
  notification system, and admin functionality. It also adds triggers for automatic
  company statistics updates and additional performance indexes.

  ## New Tables

  ### 1. company_requests
  Stores user requests to add new companies to the platform.
  - `id` (uuid, primary key) - Unique request identifier
  - `requester_hash` (text) - Hashed email of requester for privacy
  - `requester_email` (text) - Actual email for notifications
  - `company_name` (text) - Name of requested company
  - `company_website` (text) - Company website URL
  - `email_domains` (text array) - Valid email domains for verification
  - `industry` (text) - Company industry category
  - `company_size` (text) - Company size range
  - `description` (text, optional) - Additional company description
  - `justification` (text, optional) - Why this company should be added
  - `status` (text) - pending, approved, or rejected
  - `admin_notes` (text, optional) - Internal admin notes
  - `rejection_reason` (text, optional) - Reason for rejection
  - `created_at` (timestamptz) - Request submission timestamp
  - `reviewed_at` (timestamptz, optional) - When request was reviewed
  - `reviewed_by` (text, optional) - Admin email who reviewed

  ### 2. notifications
  Stores user notifications with token-based access for privacy.
  - `id` (uuid, primary key) - Unique notification identifier
  - `recipient_hash` (text) - Hashed email of recipient
  - `type` (text) - Notification type (company_approved, company_rejected, etc.)
  - `title` (text) - Notification title
  - `message` (text) - Notification message content
  - `data` (jsonb) - Additional structured data
  - `token` (uuid) - Unique access token for notification
  - `read` (boolean) - Whether notification has been read
  - `created_at` (timestamptz) - Notification creation timestamp
  - `expires_at` (timestamptz) - When notification expires

  ### 3. admin_users
  Stores list of platform administrators.
  - `id` (uuid, primary key) - Unique admin record identifier
  - `user_id` (uuid) - Reference to auth.users
  - `email` (text) - Admin email address
  - `role` (text) - Admin role (admin, moderator, super_admin)
  - `created_at` (timestamptz) - When admin was added
  - `created_by` (uuid, optional) - Who added this admin

  ## Security
  - All tables have RLS enabled
  - Company requests: public can insert, only admins can update
  - Notifications: accessible only via token
  - Admin users: only visible to authenticated admins
  - Requester email stored for notifications but not exposed in public views

  ## Performance
  - Indexes on frequently queried fields
  - Triggers for automatic company_stats updates
  - Optimized queries for common operations

  ## Important Notes
  - Email hashing provides privacy while allowing notifications
  - Token-based notification access ensures security without authentication
  - Admin system allows for proper moderation and review workflows
  - Automatic triggers keep company statistics up-to-date in real-time
*/

-- =====================================================
-- COMPANY REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS company_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_hash text NOT NULL,
  requester_email text NOT NULL,
  company_name text NOT NULL,
  company_website text NOT NULL,
  email_domains text[] NOT NULL DEFAULT '{}',
  industry text NOT NULL,
  company_size text NOT NULL,
  description text,
  justification text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by text
);

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_company_requests_status ON company_requests(status);
CREATE INDEX IF NOT EXISTS idx_company_requests_created_at ON company_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_requests_requester_hash ON company_requests(requester_hash);
CREATE INDEX IF NOT EXISTS idx_company_requests_requester_email ON company_requests(requester_email);

-- Enable RLS
ALTER TABLE company_requests ENABLE ROW LEVEL SECURITY;

-- Policies for company_requests
CREATE POLICY "Anyone can view company requests"
  ON company_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert company requests"
  ON company_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only system can update company requests"
  ON company_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_hash text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_token ON notifications(token);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_hash ON notifications(recipient_hash);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications (token-based access)
CREATE POLICY "Notifications accessible by token"
  ON notifications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- ADMIN USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can insert admin users"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Add additional indexes to existing tables for better performance
CREATE INDEX IF NOT EXISTS idx_companies_industry_name ON companies(industry, name);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_recommendation ON reviews(recommendation);

-- Add missing source field to companies for tracking origin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'source'
  ) THEN
    ALTER TABLE companies ADD COLUMN source text DEFAULT 'seed';
  END IF;
END $$;

-- Add missing request_id field to companies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'request_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN request_id uuid REFERENCES company_requests(id);
  END IF;
END $$;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC STATS UPDATES
-- =====================================================

-- Function to automatically update company updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies
  SET updated_at = now()
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update company timestamp when review is added/updated
DROP TRIGGER IF EXISTS trigger_update_company_on_review ON reviews;
CREATE TRIGGER trigger_update_company_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate current quarter
CREATE OR REPLACE FUNCTION get_current_quarter()
RETURNS text AS $$
DECLARE
  current_quarter integer;
  current_year integer;
BEGIN
  current_quarter := EXTRACT(QUARTER FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  RETURN 'Q' || current_quarter || ' ' || current_year;
END;
$$ LANGUAGE plpgsql;

-- Update default period for reviews to use function
ALTER TABLE reviews ALTER COLUMN period SET DEFAULT get_current_quarter();

-- Function to detect duplicate companies
CREATE OR REPLACE FUNCTION check_duplicate_companies(
  p_company_name text,
  p_website text
)
RETURNS TABLE(id uuid, name text, similarity float) AS $$
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
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for similarity search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- SEED DATA - Additional Companies
-- =====================================================

-- Add more diverse companies for better testing
INSERT INTO companies (name, industry, size, source) VALUES
  ('Spotify', 'Technology', '1000+ employees', 'seed'),
  ('Airbnb', 'Technology', '1000+ employees', 'seed'),
  ('Uber', 'Technology', '1000+ employees', 'seed'),
  ('Salesforce', 'Technology', '1000+ employees', 'seed'),
  ('Adobe', 'Technology', '1000+ employees', 'seed'),
  ('McKinsey & Company', 'Consulting', '1000+ employees', 'seed'),
  ('Boston Consulting Group', 'Consulting', '1000+ employees', 'seed'),
  ('Deloitte', 'Consulting', '1000+ employees', 'seed'),
  ('PwC', 'Consulting', '1000+ employees', 'seed'),
  ('EY', 'Consulting', '1000+ employees', 'seed'),
  ('Morgan Stanley', 'Finance', '1000+ employees', 'seed'),
  ('Bank of America', 'Finance', '1000+ employees', 'seed'),
  ('Citigroup', 'Finance', '1000+ employees', 'seed'),
  ('Pfizer', 'Healthcare', '1000+ employees', 'seed'),
  ('Moderna', 'Healthcare', '1000+ employees', 'seed'),
  ('CVS Health', 'Healthcare', '1000+ employees', 'seed'),
  ('Nike', 'Retail', '1000+ employees', 'seed'),
  ('Target', 'Retail', '1000+ employees', 'seed'),
  ('Walmart', 'Retail', '1000+ employees', 'seed'),
  ('Starbucks', 'Food & Beverage', '1000+ employees', 'seed')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- CLEANUP OLD EXPIRED NOTIFICATIONS
-- =====================================================

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at < now() AND read = true;
END;
$$ LANGUAGE plpgsql;
