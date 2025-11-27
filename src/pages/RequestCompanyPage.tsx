import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, Globe, Send, Loader2, Edit } from 'lucide-react';
import { getCurrentUser, submitCompanyRequest, detectDuplicateCompanies } from '../lib/supabase';
import { CompanyRequestFormData, ValidationErrors, DuplicateCompany } from '../types/companyRequest';
import FormField from '../components/FormField';
import DomainInput from '../components/DomainInput';
import IndustrySelect from '../components/IndustrySelect';
import DuplicateWarning from '../components/DuplicateWarning';
import ValidationMessage from '../components/ValidationMessage';
import ProgressBar from '../components/ProgressBar';

const RequestCompanyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fromReview, suggestedName } = location.state || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateCompany[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CompanyRequestFormData>({
    company_name: suggestedName || '',
    company_website: '',
    email_domains: [],
    industry: '',
    company_size: '',
    description: '',
    justification: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const companySizes = [
    { value: '1-50 employees', label: 'Startup/Small (1-50 employees)' },
    { value: '51-200 employees', label: 'Medium (51-200 employees)' },
    { value: '201-1000 employees', label: 'Large (201-1000 employees)' },
    { value: '1000+ employees', label: 'Enterprise (1000+ employees)' }
  ];

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/', { 
            state: { 
              message: 'Please verify your email to request a company.' 
            }
          });
          return;
        }
        setUser(currentUser);
        
        // Auto-populate email domain from user's email
        if (currentUser.email) {
          const domain = currentUser.email.split('@')[1];
          if (domain && !formData.email_domains.includes(domain)) {
            setFormData(prev => ({
              ...prev,
              email_domains: [domain]
            }));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Validation functions
  const validateField = useCallback((field: keyof CompanyRequestFormData, value: any): string => {
    switch (field) {
      case 'company_name':
        if (!value || value.trim().length < 2) {
          return 'Company name must be at least 2 characters';
        }
        if (value.trim().length > 100) {
          return 'Company name must be less than 100 characters';
        }
        return '';

      case 'company_website':
        if (!value || !value.trim()) {
          return 'Company website is required';
        }
        const urlPattern = /^https?:\/\/.+\..+/;
        if (!urlPattern.test(value)) {
          return 'Please enter a valid website URL (e.g., https://company.com)';
        }
        return '';

      case 'email_domains':
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one email domain is required';
        }
        const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
        const invalidDomain = value.find(domain => !domainPattern.test(domain));
        if (invalidDomain) {
          return `Invalid domain format: ${invalidDomain}`;
        }
        return '';

      case 'industry':
        if (!value || !value.trim()) {
          return 'Please select an industry';
        }
        return '';

      case 'company_size':
        if (!value || !value.trim()) {
          return 'Please select company size';
        }
        return '';

      case 'description':
        if (value && value.length > 500) {
          return 'Description must be less than 500 characters';
        }
        return '';

      case 'justification':
        if (value && value.length > 300) {
          return 'Justification must be less than 300 characters';
        }
        return '';

      default:
        return '';
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof CompanyRequestFormData;
      if (touched[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);
  }, [formData, touched, validateField]);

  // Auto-correct website URL
  const handleWebsiteChange = (value: string) => {
    let correctedValue = value.trim();
    
    // Auto-add https:// if missing
    if (correctedValue && !correctedValue.startsWith('http://') && !correctedValue.startsWith('https://')) {
      correctedValue = 'https://' + correctedValue;
    }
    
    setFormData(prev => ({ ...prev, company_website: correctedValue }));
    
    // Extract domain for email domains suggestion
    try {
      const url = new URL(correctedValue);
      const domain = url.hostname.replace('www.', '');
      
      if (domain && !formData.email_domains.includes(domain)) {
        // Suggest adding this domain
        setTimeout(() => {
          if (window.confirm(`Would you like to add "${domain}" to your email domains?`)) {
            setFormData(prev => ({
              ...prev,
              email_domains: [...prev.email_domains, domain]
            }));
          }
        }, 500);
      }
    } catch (error) {
      // Invalid URL, ignore
    }
  };

  // Duplicate detection with debouncing
  useEffect(() => {
    const checkDuplicates = async () => {
      if (formData.company_name.length > 2) {
        setDuplicateCheckLoading(true);
        try {
          const results = await detectDuplicateCompanies(formData.company_name, formData.company_website);
          const duplicatesWithSimilarity = results.map(company => ({
            ...company,
            similarity: calculateSimilarity(formData.company_name, company.name)
          })).filter(company => company.similarity > 0.6);
          
          setDuplicates(duplicatesWithSimilarity);
          setShowDuplicateWarning(duplicatesWithSimilarity.length > 0);
        } catch (error) {
          console.error('Duplicate detection failed:', error);
        } finally {
          setDuplicateCheckLoading(false);
        }
      } else {
        setDuplicates([]);
        setShowDuplicateWarning(false);
      }
    };

    const debounceTimer = setTimeout(checkDuplicates, 800);
    return () => clearTimeout(debounceTimer);
  }, [formData.company_name, formData.company_website]);

  // Simple similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const handleFieldChange = (field: keyof CompanyRequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setSubmitError(null);
  };

  const handleFieldBlur = (field: keyof CompanyRequestFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const calculateProgress = (): number => {
    const requiredFields = ['company_name', 'company_website', 'email_domains', 'industry', 'company_size'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof CompanyRequestFormData];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });
    
    return (completedFields.length / requiredFields.length) * 100;
  };

  const isFormValid = (): boolean => {
    const requiredFields = ['company_name', 'company_website', 'email_domains', 'industry', 'company_size'];
    
    // Check if all required fields are filled
    const allFieldsFilled = requiredFields.every(field => {
      const value = formData[field as keyof CompanyRequestFormData];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    });
    
    // Check if there are no validation errors
    const noErrors = Object.keys(errors).length === 0;
    
    return allFieldsFilled && noErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allFields = Object.keys(formData) as (keyof CompanyRequestFormData)[];
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    if (!isFormValid()) {
      setSubmitError('Please fix the errors above before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitCompanyRequest(formData);
      
      // Success - redirect to confirmation page
      navigate('/company-requested', {
        state: {
          requestId: result.id,
          companyName: result.company_name
        }
      });
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExisting = (company: DuplicateCompany) => {
    navigate(`/company/${company.id}`);
  };

  const handleContinueAnyway = () => {
    setShowDuplicateWarning(false);
  };

  const handleDismissDuplicates = () => {
    setShowDuplicateWarning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <div className="h-12 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(fromReview ? '/submit-review' : '/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{fromReview ? 'Back to Review' : 'Back to Home'}</span>
          </button>
        </div>

        {fromReview && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Edit className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  Requesting company to write a review
                </h3>
                <p className="text-sm text-blue-700">
                  Once your company request is approved, you'll receive an email notification with
                  a link to submit your review. This typically takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <ProgressBar
          progress={calculateProgress()}
          title="Request New Company"
          subtitle="Help us expand our database by suggesting your company"
        />

        {/* Duplicate Warning */}
        {showDuplicateWarning && (
          <DuplicateWarning
            duplicates={duplicates}
            onDismiss={handleDismissDuplicates}
            onUseExisting={handleUseExisting}
            onContinueAnyway={handleContinueAnyway}
          />
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Company Information
              </h2>
              <p className="text-gray-600 mt-2">
                Tell us about the company you'd like to add to our platform
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="lg:col-span-2">
                <FormField
                  label="Company Name"
                  required
                  error={errors.company_name}
                  helpText="Enter the official company name as it appears on their website"
                >
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleFieldChange('company_name', e.target.value)}
                      onBlur={() => handleFieldBlur('company_name')}
                      placeholder="Enter company name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.company_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {duplicateCheckLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {formData.company_name.length}/100 characters
                  </div>
                </FormField>
              </div>

              {/* Company Website */}
              <FormField
                label="Company Website"
                required
                error={errors.company_website}
                helpText="The main company website URL"
              >
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => handleWebsiteChange(e.target.value)}
                    onBlur={() => handleFieldBlur('company_website')}
                    placeholder="https://company.com"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.company_website ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
              </FormField>

              {/* Industry */}
              <FormField
                label="Industry"
                required
                error={errors.industry}
                helpText="Select the primary industry this company operates in"
              >
                <IndustrySelect
                  value={formData.industry}
                  onChange={(value) => handleFieldChange('industry', value)}
                  error={errors.industry}
                />
              </FormField>
            </div>

            {/* Email Domains */}
            <div className="mt-6">
              <FormField
                label="Email Domains"
                required
                error={errors.email_domains}
                helpText="Email domains used by employees (e.g., company.com, subsidiary.com)"
              >
                <DomainInput
                  domains={formData.email_domains}
                  onChange={(domains) => handleFieldChange('email_domains', domains)}
                  error={errors.email_domains}
                  placeholder="Enter email domain (e.g., company.com)"
                />
              </FormField>
            </div>
          </div>

          {/* Company Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Company Details</h2>
              <p className="text-gray-600 mt-2">
                Additional information to help us categorize and verify the company
              </p>
            </div>

            <div className="space-y-6">
              {/* Company Size */}
              <FormField
                label="Company Size"
                required
                error={errors.company_size}
                helpText="Approximate number of employees"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {companySizes.map((size) => (
                    <label
                      key={size.value}
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.company_size === size.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="company_size"
                        value={size.value}
                        checked={formData.company_size === size.value}
                        onChange={(e) => handleFieldChange('company_size', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        formData.company_size === size.value
                          ? 'border-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.company_size === size.value && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {size.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FormField>

              {/* Company Description */}
              <FormField
                label="Company Description"
                error={errors.description}
                helpText="Brief description of what the company does (optional)"
              >
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  onBlur={() => handleFieldBlur('description')}
                  placeholder="Brief description of what this company does..."
                  rows={4}
                  maxLength={500}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <div className="mt-1 text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </div>
              </FormField>

              {/* Justification */}
              <FormField
                label="Reason for Addition"
                error={errors.justification}
                helpText="Help us understand why this company should be added (optional)"
              >
                <textarea
                  value={formData.justification}
                  onChange={(e) => handleFieldChange('justification', e.target.value)}
                  onBlur={() => handleFieldBlur('justification')}
                  placeholder="Help us understand why this company should be added to our platform..."
                  rows={3}
                  maxLength={300}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                    errors.justification ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <div className="mt-1 text-sm text-gray-500">
                  {formData.justification.length}/300 characters
                </div>
              </FormField>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {submitError && (
              <div className="mb-4">
                <ValidationMessage type="error" message={submitError} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                <p>Your request will be reviewed within 48 hours.</p>
                <p>We'll notify you via email once it's processed.</p>
              </div>

              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCompanyPage;