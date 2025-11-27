import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Send, Save } from 'lucide-react';
import { getCurrentUser, submitReview } from '../lib/supabase';
import { ToastContext } from '../App';
import ProgressBar from '../components/ProgressBar';
import FormSection from '../components/FormSection';
import CompanySearch from '../components/CompanySearch';
import StarRating from '../components/StarRating';
import TextAreaWithCounter from '../components/TextAreaWithCounter';

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
}

interface RatingDimension {
  id: string;
  title: string;
  description: string;
  rating: number;
  feedback: string;
}

interface ReviewFormData {
  company: Company | null;
  industry: string;
  companySize: string;
  role: string;
  ratings: RatingDimension[];
  overallRecommendation: 'highly-recommend' | 'maybe' | 'not-recommended' | '';
  friendAdvice: string;
}

const SubmitReviewPage = () => {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<ReviewFormData>({
    company: null,
    industry: '',
    companySize: '',
    role: '',
    ratings: [
      {
        id: 'compensation',
        title: 'Compensation & Benefits',
        description: 'Salary, bonuses, health insurance, and perks.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'management',
        title: 'Management Quality',
        description: 'Executive Leadership effectiveness and overall business strategy.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'culture',
        title: 'Culture, Values & Inclusion',
        description: 'Company values, diversity, and inclusive environment',
        rating: 0,
        feedback: ''
      },
      {
        id: 'career',
        title: 'Career Opportunities & Development',
        description: 'Growth potential, learning, and skill development.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'recognition',
        title: 'Recognition & Appreciation',
        description: 'How well your work and contributions are acknowledged.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'environment',
        title: 'Working Environment',
        description: 'Office/remote setup, tools provided, and general workspace quality.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'worklife',
        title: 'Work-Life Balance',
        description: 'Flexible hours, vacation policy, stress levels, and respect for personal time.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'cooperation',
        title: 'Cooperation & Relationships',
        description: 'Quality of teamwork, communication, and colleague relationships.',
        rating: 0,
        feedback: ''
      },
      {
        id: 'business_health',
        title: 'Business Health & Outlook',
        description: 'Financial stability, long-term viability, and job security.',
        rating: 0,
        feedback: ''
      }
    ],
    overallRecommendation: '',
    friendAdvice: ''
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/', { 
            state: { 
              message: 'Please verify your email to submit a review.' 
            }
          });
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Calculate progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 13; // company + role + 9 ratings + recommendation + advice

    if (formData.company) completed++;
    if (formData.role.trim()) completed++;

    formData.ratings.forEach(rating => {
      if (rating.rating > 0) completed++;
    });

    if (formData.overallRecommendation) completed++;
    if (formData.friendAdvice.trim()) completed++;

    return (completed / total) * 100;
  };

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (formData.company || formData.ratings.some(r => r.rating > 0)) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData]);

  const handleAutoSave = async () => {
    setIsSaving(true);
    // Simulate auto-save
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleCompanySelect = (company: Company) => {
    setFormData(prev => ({
      ...prev,
      company,
      industry: company.industry,
      companySize: company.size
    }));
  };

  const handleRatingChange = (dimensionId: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: prev.ratings.map(r =>
        r.id === dimensionId ? { ...r, rating } : r
      )
    }));
  };

  const handleFeedbackChange = (dimensionId: string, feedback: string) => {
    setFormData(prev => ({
      ...prev,
      ratings: prev.ratings.map(r =>
        r.id === dimensionId ? { ...r, feedback } : r
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!formData.company) {
        toast?.error('Please select a company');
        setIsSubmitting(false);
        return;
      }

      if (!formData.role.trim()) {
        toast?.error('Please enter your role or department');
        setIsSubmitting(false);
        return;
      }

      if (!formData.overallRecommendation) {
        toast?.error('Please provide your overall recommendation');
        setIsSubmitting(false);
        return;
      }

      // Prepare review data
      const reviewData = {
        company_id: formData.company.id,
        overall_rating: Math.round(
          formData.ratings.reduce((sum, r) => sum + r.rating, 0) / formData.ratings.length
        ),
        recommendation: formData.overallRecommendation,
        role: formData.role.trim(),
        pros: formData.ratings
          .filter(r => r.feedback.trim() && r.rating >= 4)
          .map(r => r.feedback.trim())
          .slice(0, 3),
        cons: formData.ratings
          .filter(r => r.feedback.trim() && r.rating <= 2)
          .map(r => r.feedback.trim())
          .slice(0, 3),
        advice: formData.friendAdvice.trim() || undefined,
        dimensions: {
          compensation: formData.ratings.find(r => r.id === 'compensation')?.rating || 0,
          management: formData.ratings.find(r => r.id === 'management')?.rating || 0,
          culture: formData.ratings.find(r => r.id === 'culture')?.rating || 0,
          career: formData.ratings.find(r => r.id === 'career')?.rating || 0,
          recognition: formData.ratings.find(r => r.id === 'recognition')?.rating || 0,
          environment: formData.ratings.find(r => r.id === 'environment')?.rating || 0,
          worklife: formData.ratings.find(r => r.id === 'worklife')?.rating || 0,
          cooperation: formData.ratings.find(r => r.id === 'cooperation')?.rating || 0,
          business_health: formData.ratings.find(r => r.id === 'business_health')?.rating || 0,
        }
      };

      await submitReview(reviewData);

      toast?.success('Review submitted successfully! Thank you for sharing your experience.');

      // Redirect to company profile
      setTimeout(() => {
        navigate(`/company/${formData.company!.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Submission failed:', error);
      toast?.error(error.message || 'Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.company &&
      formData.role.trim().length > 0 &&
      formData.ratings.every(r => r.rating > 0) &&
      formData.overallRecommendation
    );
  };

  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
    'Manufacturing', 'Consulting', 'Media', 'Government', 'Non-profit', 'Other'
  ];

  const companySizes = [
    '1-50 employees',
    '51-200 employees', 
    '201-1000 employees',
    '1000+ employees'
  ];

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

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Edit</span>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving && (
                <span className="text-sm text-gray-500 flex items-center">
                  <Save className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Content */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Review Preview</h1>
            
            {/* Company Info */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="ml-2 text-gray-900">{formData.company?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Industry:</span>
                  <span className="ml-2 text-gray-900">{formData.industry || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Company Size:</span>
                  <span className="ml-2 text-gray-900">{formData.companySize || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-900">{formData.role || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ratings</h2>
              <div className="space-y-4">
                {formData.ratings.map((rating) => (
                  <div key={rating.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{rating.title}</h3>
                      <p className="text-sm text-gray-600">{rating.description}</p>
                      {rating.feedback && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{rating.feedback}"</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <StarRating rating={rating.rating} onRatingChange={() => {}} disabled />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Recommendation</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-2">
                  {formData.overallRecommendation === 'highly-recommend' && '✅ Highly Recommend'}
                  {formData.overallRecommendation === 'maybe' && '🤔 Maybe'}
                  {formData.overallRecommendation === 'not-recommended' && '❌ Not Recommended'}
                </p>
                {formData.friendAdvice && (
                  <p className="text-gray-700 italic">"{formData.friendAdvice}"</p>
                )}
              </div>
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
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-4">
            {isSaving && (
              <span className="text-sm text-gray-500 flex items-center">
                <Save className="w-4 h-4 mr-1 animate-spin" />
                Auto-saving...
              </span>
            )}
            <button
              onClick={() => setIsPreviewMode(true)}
              disabled={!isFormValid()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          progress={calculateProgress()} 
          title="Submit Your Review"
          subtitle="Help others make informed career decisions with your honest feedback"
        />

        {/* Company Information */}
        <FormSection 
          title="Company Information" 
          description="Tell us about the company you're reviewing"
          required
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <CompanySearch
                selectedCompany={formData.company}
                onCompanySelect={handleCompanySelect}
                placeholder="Search for your company..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select industry...</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select size...</option>
                  {companySizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Role/Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Software Engineer, Marketing Manager"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>
        </FormSection>

        {/* Rating Dimensions */}
        <FormSection 
          title="Rate Your Experience" 
          description="Rate each aspect of your workplace experience on a scale of 1-5 stars"
          required
        >
          <div className="space-y-8">
            {formData.ratings.map((dimension, index) => (
              <div key={dimension.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      {dimension.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{dimension.description}</p>
                  </div>
                  <div className="ml-6 flex flex-col items-end">
                    <StarRating
                      rating={dimension.rating}
                      onRatingChange={(rating) => handleRatingChange(dimension.id, rating)}
                      size="lg"
                    />
                    <span className="text-sm text-gray-500 mt-1">
                      {dimension.rating > 0 ? `${dimension.rating}/5` : 'Not rated'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <TextAreaWithCounter
                    value={dimension.feedback}
                    onChange={(feedback) => handleFeedbackChange(dimension.id, feedback)}
                    placeholder={`Share specific details about ${dimension.title.toLowerCase()}...`}
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        {/* Overall Recommendation */}
        <FormSection 
          title="Overall Recommendation" 
          description="Would you recommend this company to a friend?"
          required
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'highly-recommend', label: 'Highly Recommend', emoji: '✅', color: 'green' },
                { value: 'maybe', label: 'Maybe', emoji: '🤔', color: 'yellow' },
                { value: 'not-recommended', label: 'Not Recommended', emoji: '❌', color: 'red' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, overallRecommendation: option.value as any }))}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                    formData.overallRecommendation === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.emoji}</div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>

            <div>
              <TextAreaWithCounter
                value={formData.friendAdvice}
                onChange={(value) => setFormData(prev => ({ ...prev, friendAdvice: value }))}
                placeholder="What would you tell a friend considering this company?"
                maxLength={500}
                rows={4}
                label="Additional Advice (Optional)"
              />
            </div>
          </div>
        </FormSection>

        {/* Submit Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">
            Your review will be published anonymously and help others make informed career decisions.
          </p>
          <button
            onClick={() => setIsPreviewMode(true)}
            disabled={!isFormValid()}
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Preview & Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitReviewPage;