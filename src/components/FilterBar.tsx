import React from 'react';
import { Filter, SortAsc, Calendar, Star } from 'lucide-react';

interface FilterBarProps {
  filters: {
    rating: string;
    timePeriod: string;
    recommendation: string;
    sortBy: string;
  };
  onFilterChange: (key: string, value: string) => void;
  reviewCount: number;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, reviewCount }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left side - Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-400" />
            <select
              value={filters.rating}
              onChange={(e) => onFilterChange('rating', e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>

          {/* Time Period Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={filters.timePeriod}
              onChange={(e) => onFilterChange('timePeriod', e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Time</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="2years">Last 2 Years</option>
            </select>
          </div>

          {/* Recommendation Filter */}
          <select
            value={filters.recommendation}
            onChange={(e) => onFilterChange('recommendation', e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Recommendations</option>
            <option value="highly-recommend">Highly Recommend</option>
            <option value="maybe">Maybe</option>
            <option value="not-recommended">Not Recommended</option>
          </select>
        </div>

        {/* Right side - Sort and Results Count */}
        <div className="flex items-center justify-between lg:justify-end space-x-4">
          <span className="text-sm text-gray-600">
            {reviewCount} reviews
          </span>
          
          <div className="flex items-center space-x-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;