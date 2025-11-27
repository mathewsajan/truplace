import React, { useState, useEffect } from 'react';
import { Menu, X, Search, Edit, User, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, supabase, isAdmin } from '../lib/supabase';
import EmailVerificationModal from './EmailVerificationModal';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthStatus();

    // Only set up auth listener if not in testing mode
    if (import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING !== 'true') {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const adminStatus = await isAdmin();
        setUserIsAdmin(adminStatus);
      } else {
        setUserIsAdmin(false);
      }
    } catch (error) {
      setUser(null);
      setUserIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (user) {
      navigate('/submit-review');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      // In testing mode, just clear the user state
      if (import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING === 'true') {
        setUser(null);
        setIsUserMenuOpen(false);
        navigate('/');
        return;
      }

      await supabase.auth.signOut();
      setUser(null);
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserEmail = () => {
    if (!user?.email) return '';
    const email = user.email;
    if (email.length > 25) {
      return email.substring(0, 22) + '...';
    }
    return email;
  };

  return (
    <>
      {import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING === 'true' && (
        <div className="bg-yellow-400 text-gray-900 py-2 px-4 text-center text-sm font-medium">
          ⚠️ Testing Mode Active - Email Verification Disabled
        </div>
      )}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Truplace</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/companies" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              Companies
            </a>
            <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
              About
            </a>
            {userIsAdmin && (
              <a href="/admin/company-requests" className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </a>
            )}
          </nav>

          {/* CTA Button & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleWriteReviewClick}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Write a Review</span>
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{getUserEmail()}</p>
                      {userIsAdmin && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 mt-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          <Shield className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      )}
                    </div>
                    {userIsAdmin && (
                      <a
                        href="/admin/company-requests"
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2 transition-colors duration-200"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </a>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user && (
              <div className="px-4 py-3 mb-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 truncate">{getUserEmail()}</p>
              </div>
            )}
            <nav className="flex flex-col space-y-4">
              <a href="/companies" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                Companies
              </a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                About
              </a>
              {userIsAdmin && (
                <a href="/admin/company-requests" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </a>
              )}
              <button
                onClick={handleWriteReviewClick}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 w-full"
              >
                <Edit className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-2 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
      </header>

      <EmailVerificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Header;