import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin, supabase } from '../lib/supabase';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAdminAccess();
      } else if (!loading) {
        setError('You must be logged in to access this page');
        setAuthorized(false);
        setTimeout(() => navigate('/'), 2000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setError('You must be logged in to access this page');
        setLoading(false);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      const isAdminUser = await isAdmin();

      if (!isAdminUser) {
        setError('You do not have admin privileges to access this page');
        setLoading(false);
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setAuthorized(true);
      setLoading(false);
    } catch (err) {
      console.error('Admin access check failed:', err);
      setError('Failed to verify admin access');
      setLoading(false);
      setTimeout(() => navigate('/'), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <Shield className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
