import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { getNotificationByToken, markNotificationAsRead, getCurrentUser } from '../lib/supabase';
import EmailVerificationModal from '../components/EmailVerificationModal';

interface NotificationData {
  company_id?: string;
  company_name?: string;
  rejection_reason?: string;
  request_id?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: NotificationData;
  read: boolean;
  created_at: string;
  expires_at: string;
}

const NotificationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const fetchNotificationAndUser = async () => {
      if (!token) {
        setError('Invalid notification link');
        setLoading(false);
        return;
      }

      try {
        const [notificationData, userData] = await Promise.all([
          getNotificationByToken(token),
          getCurrentUser(),
        ]);

        if (!notificationData) {
          setError('Notification not found or has expired');
          setLoading(false);
          return;
        }

        const expiresAt = new Date(notificationData.expires_at);
        if (expiresAt < new Date()) {
          setError('This notification has expired');
          setLoading(false);
          return;
        }

        setNotification(notificationData);
        setUser(userData);

        if (!notificationData.read) {
          await markNotificationAsRead(token);
        }
      } catch (err) {
        console.error('Error fetching notification:', err);
        setError('Failed to load notification');
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationAndUser();
  }, [token]);

  const handleProceedToReview = () => {
    if (!user) {
      setShowEmailModal(true);
      return;
    }

    if (notification?.data?.company_id) {
      navigate('/submit-review', {
        state: {
          companyId: notification.data.company_id,
          companyName: notification.data.company_name,
          fromNotification: true,
        },
      });
    }
  };

  const handleEmailVerified = () => {
    setShowEmailModal(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading notification...</p>
        </div>
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Notification Not Available
              </h1>
              <p className="text-gray-600 mb-6">
                {error || 'This notification could not be found'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = notification.type === 'company_approved';
  const isRejected = notification.type === 'company_rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isApproved ? 'bg-green-100' : 'bg-yellow-100'
              }`}
            >
              {isApproved ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-yellow-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {notification.title}
            </h1>
            <p className="text-lg text-gray-600">{notification.message}</p>
          </div>

          {isApproved && notification.data?.company_name && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-blue-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Company Added</h2>
                    <p className="text-gray-700 text-lg font-medium">
                      {notification.data.company_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-blue-600 font-semibold">1</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Share Your Experience</h4>
                      <p className="text-gray-600 text-sm">
                        Write an honest review about your experience working at{' '}
                        {notification.data.company_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Help Others Decide</h4>
                      <p className="text-gray-600 text-sm">
                        Your insights will help job seekers make informed career decisions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
                <button
                  onClick={handleProceedToReview}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>Write Your Review</span>
                </button>
              </div>
            </>
          )}

          {isRejected && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <div className="space-y-3">
                  {notification.data?.company_name && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Company Name</h3>
                      <p className="text-gray-700">{notification.data.company_name}</p>
                    </div>
                  )}
                  {notification.data?.rejection_reason && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Reason</h3>
                      <p className="text-gray-700">{notification.data.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                <h3 className="font-medium text-gray-900 mb-2">What You Can Do</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Request a different company to review</li>
                  <li>• Browse our existing company database</li>
                  <li>
                    • Contact us at{' '}
                    <a
                      href="mailto:support@truplace.com"
                      className="text-blue-600 hover:underline"
                    >
                      support@truplace.com
                    </a>{' '}
                    if you have questions
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
                <button
                  onClick={() => navigate('/request-company')}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <span>Request Another Company</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Have questions? Contact us at{' '}
            <a href="mailto:support@truplace.com" className="text-blue-600 hover:underline">
              support@truplace.com
            </a>
          </p>
        </div>
      </div>

      {showEmailModal && (
        <EmailVerificationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onVerified={handleEmailVerified}
        />
      )}
    </div>
  );
};

export default NotificationPage;
