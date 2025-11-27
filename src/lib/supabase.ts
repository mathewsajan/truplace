import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types for our database
export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  logo_url?: string;
  source?: string;
  request_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  company_id: string;
  user_id: string;
  overall_rating: number;
  recommendation: 'highly-recommend' | 'maybe' | 'not-recommended';
  role?: string;
  period: string;
  pros: string[];
  cons: string[];
  advice?: string;
  dimensions: {
    compensation: number;
    management: number;
    culture: number;
    career: number;
    recognition: number;
    environment: number;
    worklife: number;
    cooperation: number;
    business_health: number;
  };
  helpful_count: number;
  created_at: string;
}

export interface CompanyStats {
  id: string;
  name: string;
  industry: string;
  size: string;
  logo_url?: string;
  overall_rating: number;
  review_count: number;
  recommendation_rate: number;
  dimensions: {
    compensation: number;
    management: number;
    culture: number;
    career: number;
    recognition: number;
    environment: number;
    worklife: number;
    cooperation: number;
    business_health: number;
  };
  created_at: string;
  updated_at: string;
}

// Authentication helpers
export const sendMagicLink = async (email: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${import.meta.env.VITE_APP_URL}/submit-review`,
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING === 'true') {
    console.warn('⚠️ TESTING MODE: Email verification is bypassed');
    return {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const handleAuthCallback = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Company data helpers
export const getCompanies = async () => {
  const { data, error } = await supabase
    .from('company_stats')
    .select('*')
    .order('review_count', { ascending: false });
  
  if (error) throw error;
  return data as CompanyStats[];
};

export const getCompanyById = async (id: string) => {
  const { data, error } = await supabase
    .from('company_stats')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as CompanyStats | null;
};

export const searchCompanies = async (query: string) => {
  if (!query.trim()) {
    // Return popular companies if no query
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, industry, size')
      .order('name')
      .limit(10);

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('companies')
    .select('id, name, industry, size')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10);

  if (error) throw error;
  return data;
};

// Review data helpers
export const getReviewsByCompany = async (companyId: string, filters?: {
  rating?: number;
  recommendation?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId);

  // Apply filters
  if (filters?.rating) {
    query = query.gte('overall_rating', filters.rating);
  }
  
  if (filters?.recommendation) {
    query = query.eq('recommendation', filters.recommendation);
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'rating-high':
      query = query.order('overall_rating', { ascending: false });
      break;
    case 'rating-low':
      query = query.order('overall_rating', { ascending: true });
      break;
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as Review[];
};

export const submitReview = async (reviewData: {
  company_id: string;
  overall_rating: number;
  recommendation: 'highly-recommend' | 'maybe' | 'not-recommended';
  role?: string;
  pros: string[];
  cons: string[];
  advice?: string;
  dimensions: {
    compensation: number;
    management: number;
    culture: number;
    career: number;
    recognition: number;
    environment: number;
    worklife: number;
    cooperation: number;
    business_health: number;
  };
}) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User must be authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      user_id: user.id,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Review;
};

export const createCompany = async (companyData: {
  name: string;
  industry: string;
  size: string;
  logo_url?: string;
  source?: string;
  request_id?: string;
}) => {
  const { data, error } = await supabase
    .from('companies')
    .insert(companyData)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Company;
};

// Utility function to validate company domain
export const validateCompanyDomain = (email: string, companyName: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  // Simple domain validation - in production, you'd have a more sophisticated system
  const companyDomains: { [key: string]: string[] } = {
    'google': ['google.com', 'alphabet.com'],
    'apple': ['apple.com'],
    'microsoft': ['microsoft.com'],
    'amazon': ['amazon.com'],
    'meta': ['meta.com', 'facebook.com'],
    'netflix': ['netflix.com'],
    'tesla': ['tesla.com'],
    'spotify': ['spotify.com'],
    'airbnb': ['airbnb.com'],
    'uber': ['uber.com'],
    'goldman sachs': ['goldmansachs.com', 'gs.com'],
    'jpmorgan chase': ['jpmorganchase.com', 'jpmorgan.com'],
    'mckinsey & company': ['mckinsey.com'],
    'deloitte': ['deloitte.com'],
    'pwc': ['pwc.com']
  };

  const companyKey = companyName.toLowerCase();
  const allowedDomains = companyDomains[companyKey] || [];
  
  return allowedDomains.includes(domain);
};

// Hash email for anonymization (client-side hashing for demo purposes)
export const hashEmail = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Company Request System Types
export interface CompanyRequest {
  id: string;
  requester_hash: string;
  requester_email: string;
  company_name: string;
  company_website: string;
  email_domains: string[];
  industry: string;
  company_size: string;
  description?: string;
  justification?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Notification {
  id: string;
  recipient_hash: string;
  type: string;
  title: string;
  message: string;
  data: any;
  token: string;
  read: boolean;
  created_at: string;
  expires_at: string;
}

// Company Request Functions
export const submitCompanyRequest = async (requestData: {
  company_name: string;
  company_website: string;
  email_domains: string[];
  industry: string;
  company_size: string;
  description?: string;
  justification?: string;
}) => {
  const user = await getCurrentUser();
  if (!user?.email) throw new Error('User must be authenticated');

  const emailHash = await hashEmail(user.email);

  const { data, error } = await supabase
    .from('company_requests')
    .insert({
      ...requestData,
      requester_hash: emailHash,
      requester_email: user.email,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as CompanyRequest;
};

export const getCompanyRequests = async (filters?: {
  status?: string;
  industry?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('company_requests')
    .select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.industry) {
    query = query.eq('industry', filters.industry);
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as CompanyRequest[];
};

export const updateCompanyRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string,
  rejectionReason?: string
) => {
  const user = await getCurrentUser();
  if (!user?.email) throw new Error('Admin must be authenticated');

  const { data, error } = await supabase
    .from('company_requests')
    .update({
      status,
      admin_notes: adminNotes,
      rejection_reason: rejectionReason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.email,
    })
    .eq('id', requestId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as CompanyRequest;
};

export const approveCompanyRequest = async (requestId: string, adminNotes?: string) => {
  // First update the request status
  const request = await updateCompanyRequestStatus(requestId, 'approved', adminNotes);

  // Create the company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: request.company_name,
      industry: request.industry,
      size: request.company_size,
      source: 'user_request',
      request_id: requestId,
    })
    .select()
    .maybeSingle();

  if (companyError) throw companyError;

  // Send notification to requester
  const notification = await createNotification({
    recipient_hash: request.requester_hash,
    type: 'company_approved',
    title: 'Company Request Approved!',
    message: `Your request to add "${request.company_name}" has been approved. You can now submit your review.`,
    data: {
      company_id: company.id,
      company_name: request.company_name,
      request_id: requestId,
    },
  });

  // Send email notification
  try {
    const { sendCompanyApprovedEmail } = await import('./emailService');
    await sendCompanyApprovedEmail(
      request.requester_email,
      request.company_name,
      notification.token
    );
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }

  return { request, company };
};

export const rejectCompanyRequest = async (
  requestId: string,
  rejectionReason: string,
  adminNotes?: string
) => {
  const request = await updateCompanyRequestStatus(requestId, 'rejected', adminNotes, rejectionReason);

  // Send notification to requester
  const notification = await createNotification({
    recipient_hash: request.requester_hash,
    type: 'company_rejected',
    title: 'Company Request Update',
    message: `Your request to add "${request.company_name}" could not be approved. Reason: ${rejectionReason}`,
    data: {
      company_name: request.company_name,
      rejection_reason: rejectionReason,
      request_id: requestId,
    },
  });

  // Send email notification
  try {
    const { sendCompanyRejectedEmail } = await import('./emailService');
    await sendCompanyRejectedEmail(
      request.requester_email,
      request.company_name,
      notification.token,
      rejectionReason
    );
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
  }

  return request;
};

// Notification Functions
export const createNotification = async (notificationData: {
  recipient_hash: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notificationData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Notification;
};

export const getNotificationByToken = async (token: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (error) throw error;
  return data as Notification | null;
};

export const markNotificationAsRead = async (token: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('token', token)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Notification | null;
};

// Admin Functions
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;

    // In testing mode, test user is always admin
    if (import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING === 'true' && user.id === '00000000-0000-0000-0000-000000000001') {
      return true;
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    return !error && !!data;
  } catch {
    return false;
  }
};

// Duplicate Detection
export const detectDuplicateCompanies = async (companyName: string, website: string) => {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name')
    .or(`name.ilike.%${companyName}%,name.ilike.%${website.replace('https://', '').replace('www.', '')}%`);

  if (error) return [];
  return data || [];
};