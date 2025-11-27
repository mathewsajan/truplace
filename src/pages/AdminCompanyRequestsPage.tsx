import React, { useState, useEffect, useContext } from 'react';
import { RefreshCw, Inbox } from 'lucide-react';
import AdminRoute from '../components/AdminRoute';
import AdminStats from '../components/AdminStats';
import AdminFilters from '../components/AdminFilters';
import RequestCard from '../components/RequestCard';
import RequestDetailModal from '../components/RequestDetailModal';
import ApproveRequestModal from '../components/ApproveRequestModal';
import RejectRequestModal from '../components/RejectRequestModal';
import { ToastContext } from '../App';
import {
  getCompanyRequests,
  approveCompanyRequest,
  rejectCompanyRequest,
  CompanyRequest
} from '../lib/supabase';

const AdminCompanyRequestsPage = () => {
  const toast = useContext(ToastContext);
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CompanyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<CompanyRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter, industryFilter, searchQuery]);

  const fetchRequests = async () => {
    try {
      const data = await getCompanyRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast?.addToast('Failed to load company requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getCompanyRequests();
      setRequests(data);
      toast?.addToast('Requests refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing requests:', error);
      toast?.addToast('Failed to refresh requests', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(req => req.industry === industryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.company_name.toLowerCase().includes(query) ||
        req.company_website.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const getUniqueIndustries = () => {
    const industries = new Set(requests.map(req => req.industry));
    return Array.from(industries).sort();
  };

  const getStats = () => {
    const pending = requests.filter(req => req.status === 'pending').length;
    const rejected = requests.filter(req => req.status === 'rejected').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const approvedToday = requests.filter(req => {
      if (req.status !== 'approved' || !req.reviewed_at) return false;
      const reviewDate = new Date(req.reviewed_at);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate.getTime() === today.getTime();
    }).length;

    return {
      pending,
      approvedToday,
      rejected,
      total: requests.length
    };
  };

  const handleViewDetails = (request: CompanyRequest) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const handleApprove = (request: CompanyRequest) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleReject = (request: CompanyRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleConfirmApprove = async (
    requestId: string,
    adminNotes?: string,
    editedDetails?: any
  ) => {
    try {
      await approveCompanyRequest(requestId, adminNotes, editedDetails);
      toast?.addToast('Company request approved successfully', 'success');
      await fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  };

  const handleConfirmReject = async (
    requestId: string,
    rejectionReason: string,
    adminNotes?: string
  ) => {
    try {
      await rejectCompanyRequest(requestId, rejectionReason, adminNotes);
      toast?.addToast('Company request rejected', 'success');
      await fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  };

  const stats = getStats();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Company Requests
              </h1>
              <p className="text-gray-600">
                Review and manage company addition requests
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

          {/* Stats */}
          <AdminStats
            pendingCount={stats.pending}
            approvedToday={stats.approvedToday}
            rejectedCount={stats.rejected}
            totalCount={stats.total}
          />

          {/* Filters */}
          <AdminFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            industryFilter={industryFilter}
            setIndustryFilter={setIndustryFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            industries={getUniqueIndustries()}
          />

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Loading requests...</p>
              </div>
            </div>
          )}

          {/* Requests List */}
          {!loading && (
            <>
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No requests found
                  </h3>
                  <p className="text-gray-600">
                    {requests.length === 0
                      ? 'No company requests have been submitted yet.'
                      : 'No requests match your current filters.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {filteredRequests.length} of {requests.length} request{requests.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRequests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onViewDetails={handleViewDetails}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
      <ApproveRequestModal
        request={selectedRequest}
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleConfirmApprove}
      />
      <RejectRequestModal
        request={selectedRequest}
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
      />
    </AdminRoute>
  );
};

export default AdminCompanyRequestsPage;