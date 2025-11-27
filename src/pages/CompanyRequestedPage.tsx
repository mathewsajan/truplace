import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Mail, ArrowLeft, Bell } from 'lucide-react';

const CompanyRequestedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId, companyName } = location.state || {};

  useEffect(() => {
    if (!requestId || !companyName) {
      navigate('/request-company');
    }
  }, [requestId, companyName, navigate]);

  if (!requestId || !companyName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for helping us expand our company database
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Building2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-gray-900 mb-1">
                  Company Requested
                </h2>
                <p className="text-gray-700 text-lg font-medium">{companyName}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Reference ID: <span className="font-mono">{requestId.slice(0, 8)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What happens next?
            </h3>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Review Process</h4>
                  <p className="text-gray-600 text-sm">
                    Our team will review your request within 48 hours to verify the company information
                    and ensure it meets our quality standards.
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
                  <h4 className="font-medium text-gray-900 mb-1">Email Notification</h4>
                  <p className="text-gray-600 text-sm">
                    Once approved, you'll receive an email notification with a direct link to submit
                    your review for {companyName}.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-blue-600 font-semibold">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Share Your Experience</h4>
                  <p className="text-gray-600 text-sm">
                    After the company is added, you can write your review and help others learn
                    about working there.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Estimated Review Time
                </h4>
                <p className="text-gray-600 text-sm">
                  Most requests are processed within 24-48 hours. You'll receive an email at the
                  address associated with your account once your request is reviewed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Check Your Email
                </h4>
                <p className="text-gray-600 text-sm">
                  Make sure to check your spam folder if you don't see our email. Add
                  notifications@truplace.com to your contacts to ensure delivery.
                </p>
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
              onClick={() => navigate('/companies')}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>Browse Companies</span>
            </button>
          </div>
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
    </div>
  );
};

const Building2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
  </svg>
);

export default CompanyRequestedPage;
