import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface CompanySuggestion {
  id: string;
  name: string;
  industry: string;
  review_count: number;
}

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CompanySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_stats')
          .select('id, name, industry, review_count')
          .ilike('name', `%${searchQuery}%`)
          .order('review_count', { ascending: false })
          .limit(5);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/companies?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Tagline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Anonymous Reviews.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Real Insights.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover what it's really like to work at any company. Share your experience
            anonymously and help others make informed career decisions.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  placeholder="Search for a company (e.g. Google, Apple)"
                  className="w-full px-6 py-4 pr-32 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-lg"
                  aria-label="Search for companies"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.length > 0 || isLoading) && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                  {isLoading ? (
                    <div className="px-6 py-4 text-center text-gray-500">
                      <div className="animate-pulse">Searching...</div>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {suggestions.map((company) => (
                        <li key={company.id}>
                          <button
                            onClick={() => handleSuggestionClick(company.id)}
                            className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-500">{company.industry}</div>
                            </div>
                            <div className="text-sm text-gray-400 flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{company.review_count} reviews</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!isLoading && suggestions.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={handleSearch}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Verified Reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Thousands of Companies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
