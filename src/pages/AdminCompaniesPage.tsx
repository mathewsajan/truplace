import React, { useState, useEffect, useContext } from 'react';
import { RefreshCw, Search, Building2, Edit, Eye, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';
import CompanyEditModal from '../components/CompanyEditModal';
import { ToastContext } from '../App';
import { getCompanies, CompanyStats } from '../lib/supabase';

const AdminCompaniesPage = () => {
  const toast = useContext(ToastContext);
  const [companies, setCompanies] = useState<CompanyStats[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [industryFilter, setIndustryFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, industryFilter, sizeFilter, searchQuery]);

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast?.addToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
      toast?.addToast('Companies refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing companies:', error);
      toast?.addToast('Failed to refresh companies', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];

    if (industryFilter !== 'all') {
      filtered = filtered.filter(company => company.industry === industryFilter);
    }

    if (sizeFilter !== 'all') {
      filtered = filtered.filter(company => company.size === sizeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(query)
      );
    }

    setFilteredCompanies(filtered);
  };

  const getUniqueIndustries = () => {
    const industries = new Set(companies.map(company => company.industry));
    return Array.from(industries).sort();
  };

  const getUniqueSizes = () => {
    const sizes = new Set(companies.map(company => company.size));
    return Array.from(sizes).sort();
  };

  const handleEdit = (company: CompanyStats) => {
    setSelectedCompany(company);
    setEditModalOpen(true);
  };

  const handleEditComplete = async () => {
    setEditModalOpen(false);
    await fetchCompanies();
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manage Companies
              </h1>
              <p className="text-gray-600">
                View and edit company information
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Companies
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Industries</option>
                  {getUniqueIndustries().map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sizes</option>
                  {getUniqueSizes().map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading companies...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {filteredCompanies.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No companies found
                  </h3>
                  <p className="text-gray-600">
                    {companies.length === 0
                      ? 'No companies have been added yet.'
                      : 'No companies match your current filters.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {filteredCompanies.length} of {companies.length} companies
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {company.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {company.industry}
                            </p>
                            <p className="text-sm text-gray-500">
                              {company.size}
                            </p>
                          </div>
                          {company.logo_url && (
                            <img
                              src={company.logo_url}
                              alt={company.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Rating:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {company.overall_rating.toFixed(1)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Reviews:</span>
                            <span className="ml-1 font-semibold text-gray-900">
                              {company.review_count}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                          <Link
                            to={`/company/${company.id}`}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Link>
                          <button
                            onClick={() => handleEdit(company)}
                            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <CompanyEditModal
        company={selectedCompany}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onComplete={handleEditComplete}
      />
    </AdminRoute>
  );
};

export default AdminCompaniesPage;
