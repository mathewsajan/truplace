import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Star,
  Users,
  TrendingUp,
  Calendar,
  Edit,
  ArrowLeft,
  BarChart3,
  MessageSquare,
  Award
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getCompanyById, getReviewsByCompany } from '../lib/supabase';

import RatingBar from '../components/RatingBar';
import ReviewCard from '../components/ReviewCard';
import MetricCard from '../components/MetricCard';
import ComparisonTable from '../components/ComparisonTable';
import FilterBar from '../components/FilterBar';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { CompanyStats, Review } from '../lib/supabase';

const CompanyProfilePage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filters, setFilters] = useState({
    rating: '',
    timePeriod: '',
    recommendation: '',
    sortBy: 'recent'
  });

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        if (!companyId) {
          setError('Company not found');
          return;
        }
        
        const companyData = await getCompanyById(companyId);
        setCompany(companyData);
        
        // Fetch reviews
        const reviews = await getReviewsByCompany(companyId, { limit: 10 });
        setFilteredReviews(reviews);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Company not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  useEffect(() => {
    if (!company) return;

    const fetchFilteredReviews = async () => {
      try {
        const filterOptions: any = {};
        
        if (filters.rating) {
          filterOptions.rating = parseInt(filters.rating);
        }
        
        if (filters.recommendation) {
          filterOptions.recommendation = filters.recommendation;
        }
        
        filterOptions.sortBy = filters.sortBy;
        filterOptions.limit = 20;
        
        const reviews = await getReviewsByCompany(company.id, filterOptions);
        setFilteredReviews(reviews);
      } catch (error) {
        console.error('Error fetching filtered reviews:', error);
      }
    };

    fetchFilteredReviews();
  }, [filters, company]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <div className="h-12 bg-gray-300 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Company not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCompanyLogo = (name: string) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600'];
    const colorIndex = name.length % colors.length;
    
    return (
      <div className={`w-16 h-16 ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white font-bold text-2xl`}>
        {name.charAt(0)}
      </div>
    );
  };

  // Prepare chart data
  const recommendationData = [
    { name: 'Highly Recommend', value: Math.round(company.recommendation_rate * 0.7), color: '#10b981' },
    { name: 'Maybe', value: Math.round(company.recommendation_rate * 0.2), color: '#f59e0b' },
    { name: 'Not Recommended', value: Math.round(100 - company.recommendation_rate), color: '#ef4444' }
  ];

  const ratingDistribution = [
    { rating: '5★', count: Math.round(company.review_count * 0.35) },
    { rating: '4★', count: Math.round(company.review_count * 0.28) },
    { rating: '3★', count: Math.round(company.review_count * 0.22) },
    { rating: '2★', count: Math.round(company.review_count * 0.10) },
    { rating: '1★', count: Math.round(company.review_count * 0.05) }
  ];

  // Mock competitors for now - in production, fetch from API
  const competitors = [
    { id: 'comp1', name: 'Microsoft', rating: 4.2, reviewCount: 856, recommendationRate: 78, industry: company.industry },
    { id: 'comp2', name: 'Meta', rating: 3.9, reviewCount: 642, recommendationRate: 71, industry: company.industry },
    { id: 'comp3', name: 'Netflix', rating: 4.0, reviewCount: 423, recommendationRate: 74, industry: company.industry }
  ];
  
  const industryAvg = { rating: 3.8, recommendationRate: 73 };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          {/* Company Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start space-x-6 mb-6 lg:mb-0">
                {getCompanyLogo(company.name)}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {company.industry}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">{company.size}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Updated {new Date(company.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {renderStars(company.overall_rating)}
                      </div>
                      <span className="text-xl font-bold text-gray-900">
                        {company.overall_rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">{company.review_count.toLocaleString()}</span> reviews
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium text-green-600">{company.recommendation_rate}%</span> recommend
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Write a Review</span>
                </button>
                {company.overall_rating > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">
                      Active reviews
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Overall Rating"
              value={company.overall_rating.toFixed(1)}
              subtitle="out of 5.0"
              icon={Star}
              color="blue"
            />
            <MetricCard
              title="Total Reviews"
              value={company.review_count.toLocaleString()}
              subtitle="employee reviews"
              icon={MessageSquare}
              color="green"
            />
            <MetricCard
              title="Recommend Rate"
              value={`${company.recommendation_rate}%`}
              subtitle="would recommend"
              icon={Award}
              color={company.recommendation_rate >= 80 ? 'green' : company.recommendation_rate >= 60 ? 'yellow' : 'red'}
            />
            <MetricCard
              title="Company Size"
              value={company.size.split(' ')[0]}
              subtitle="employees"
              icon={Users}
              color="gray"
            />
          </div>

          {/* Rating Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Dimension Ratings */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Rating Breakdown
              </h2>
              <div className="space-y-1">
                <RatingBar
                  title="Compensation & Benefits"
                  rating={company.dimensions.compensation}
                  reviewCount={Math.round(company.review_count * 0.8)}
                />
                <RatingBar
                  title="Management Quality"
                  rating={company.dimensions.management}
                  reviewCount={Math.round(company.review_count * 0.7)}
                />
                <RatingBar
                  title="Culture, Values & Inclusion"
                  rating={company.dimensions.culture}
                  reviewCount={Math.round(company.review_count * 0.9)}
                />
                <RatingBar
                  title="Career Opportunities & Development"
                  rating={company.dimensions.career}
                  reviewCount={Math.round(company.review_count * 0.6)}
                />
                <RatingBar
                  title="Recognition & Appreciation"
                  rating={company.dimensions.recognition}
                  reviewCount={Math.round(company.review_count * 0.5)}
                />
                <RatingBar
                  title="Working Environment"
                  rating={company.dimensions.environment}
                  reviewCount={Math.round(company.review_count * 0.8)}
                />
                <RatingBar
                  title="Work-Life Balance"
                  rating={company.dimensions.worklife}
                  reviewCount={Math.round(company.review_count * 0.9)}
                />
                <RatingBar
                  title="Cooperation & Relationships"
                  rating={company.dimensions.cooperation}
                  reviewCount={Math.round(company.review_count * 0.7)}
                />
                <RatingBar
                  title="Business Health & Outlook"
                  rating={company.dimensions.business_health}
                  reviewCount={Math.round(company.review_count * 0.6)}
                />
              </div>
            </div>

            {/* Charts */}
            <div className="space-y-6">
              {/* Recommendation Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recommendation Breakdown
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={recommendationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {recommendationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {recommendationData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Rating Distribution
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ratingDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="rating" type="category" width={30} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Review Insights */}
          {/* Reviews Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Employee Reviews
              </h2>
            </div>

            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              reviewCount={filteredReviews.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {filteredReviews.map((review) => (
                <ReviewCard 
                  key={review.id}
                  rating={review.overall_rating}
                  recommendation={review.recommendation}
                  excerpt={review.advice || 'No additional comments provided.'}
                  role={review.role || 'Anonymous Employee'}
                  period={review.period}
                  pros={review.pros}
                  cons={review.cons}
                  helpfulCount={review.helpful_count}
                />
              ))}
            </div>

            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No reviews match your current filters.</p>
                <button
                  onClick={() => setFilters({ rating: '', timePeriod: '', recommendation: '', sortBy: 'recent' })}
                  className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {filteredReviews.length > 0 && filteredReviews.length < company.review_count && (
              <div className="text-center">
                <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200">
                  Load More Reviews
                </button>
              </div>
            )}
          </div>

          {/* Comparison Section */}
          <ComparisonTable
            currentCompany={{
              id: company.id,
              name: company.name,
              rating: company.overall_rating,
              reviewCount: company.review_count,
              recommendationRate: company.recommendation_rate,
              industry: company.industry
            }}
            competitors={competitors}
            industryAverage={industryAvg}
          />
        </div>
      </div>

      <EmailVerificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default CompanyProfilePage;