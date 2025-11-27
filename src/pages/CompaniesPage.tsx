import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, TrendingUp, Building2, Users, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CompanyStats } from '../lib/supabase';

type SortOption = 'name' | 'rating' | 'reviews' | 'recent';

const CompaniesPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('reviews');
  const [showFilters, setShowFilters] = useState(false);

  const industries = [
    'All Industries',
    'Technology',
    'Finance',
    'Healthcare',
    'Consulting',
    'E-commerce',
    'Entertainment',
    'Automotive',
    'Retail',
    'Food & Beverage'
  ];

  const companySizes = [
    'All Sizes',
    '1-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchQuery, selectedIndustry, selectedSize, sortBy]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_stats')
        .select('*')
        .order('review_count', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];

    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    if (selectedSize !== 'all') {
      filtered = filtered.filter(company => company.size === selectedSize);
    }

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'recent':
        filtered.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }

    setFilteredCompanies(filtered);
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Companies</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Company Directory
          </h1>
          <p className="text-lg text-gray-600">
            Explore {companies.length.toLocaleString()} companies and their workplace reviews
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="reviews">Most Reviewed</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Alphabetical</option>
              <option value="recent">Recently Updated</option>
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {industries.map((industry) => (
                    <option
                      key={industry}
                      value={industry === 'All Industries' ? 'all' : industry}
                    >
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {companySizes.map((size) => (
                    <option key={size} value={size === 'All Sizes' ? 'all' : size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredCompanies.length}</span> of{' '}
            <span className="font-semibold">{companies.length}</span> companies
          </p>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-sm">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 text-left group"
              >
                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                      {company.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                      <Building2 className="w-3 h-3" />
                      <span>{company.industry}</span>
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(company.overall_rating)}
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {company.overall_rating.toFixed(1)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{company.review_count} reviews</span>
                  </div>
                  <div className="text-green-600 font-medium">
                    {company.recommendation_rate}% recommend
                  </div>
                </div>

                {/* Company Size */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">{company.size}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination placeholder */}
        {filteredCompanies.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Showing all {filteredCompanies.length} companies
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;
