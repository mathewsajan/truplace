import React from 'react';
import { Search, X } from 'lucide-react';

interface AdminFiltersProps {
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  industryFilter: string;
  setIndustryFilter: (industry: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  industries: string[];
}

const AdminFilters: React.FC<AdminFiltersProps> = ({
  statusFilter,
  setStatusFilter,
  industryFilter,
  setIndustryFilter,
  searchQuery,
  setSearchQuery,
  industries
}) => {
  const hasActiveFilters = statusFilter !== 'all' || industryFilter !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setStatusFilter('all');
    setIndustryFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full lg:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Industry Filter */}
        <div className="w-full lg:w-48">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-4 h-4" />
            <span className="whitespace-nowrap">Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminFilters;
