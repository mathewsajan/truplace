import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { sendMagicLink } from '../lib/supabase';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isTestingMode = import.meta.env.VITE_DISABLE_AUTH_FOR_TESTING === 'true';
  const allowPersonalEmails = import.meta.env.VITE_ALLOW_PERSONAL_EMAILS === 'true';

  useEffect(() => {
    if (isOpen && isTestingMode) {
      window.location.href = '/submit-review';
    }
  }, [isOpen, isTestingMode]);

  const blockedDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
    'icloud.com', 'live.com', 'msn.com', 'ymail.com', 'protonmail.com',
    'mail.com', 'zoho.com', 'gmx.com'
  ];

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setIsValid(null);
      setErrorMessage('');
      setIsLoading(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Real-time email validation
  useEffect(() => {
    if (!email) {
      setIsValid(null);
      setErrorMessage('');
      return;
    }

    // Check email format
    if (!emailRegex.test(email)) {
      setIsValid(false);
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // TESTING: Skip work email validation if VITE_ALLOW_PERSONAL_EMAILS is enabled
    // WARNING: This should be disabled in production!
    if (!allowPersonalEmails) {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain && blockedDomains.includes(domain)) {
        setIsValid(false);
        setErrorMessage('Please use your work email address. Personal email providers are not allowed.');
        return;
      }
    }

    // Email is valid
    setIsValid(true);
    setErrorMessage('');
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !email) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await sendMagicLink(email);
      
      setIsSuccess(true);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || isTestingMode) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 text-center leading-relaxed">
            To keep reviews authentic and anonymous, please verify your email.
            We'll send you a secure magic link for instant access.
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6">
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isValid === false 
                        ? 'border-red-300 bg-red-50' 
                        : isValid === true 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-300'
                    }`}
                    aria-describedby={errorMessage ? 'email-error' : undefined}
                  />
                  
                  {/* Validation Icon */}
                  {isValid !== null && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValid ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errorMessage}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Magic Link</span>
                )}
              </button>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Magic Link Sent!
              </h3>
              <p className="text-gray-600">
                Check your email to continue. The link will expire in 15 minutes.
              </p>
            </div>
          )}

          {/* Security Assurance */}
          {!isSuccess && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium">🔒 Secure & Password-Free</span> - 
                    Click the magic link in your email to sign in instantly. 
                    No passwords to remember!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Support Link */}
          <div className="mt-6 text-center">
            <a 
              href="/support" 
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Need help? Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;