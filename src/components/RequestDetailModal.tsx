import React from 'react';
import { X, Globe, Building2, Users, Mail, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { CompanyRequest } from '../lib/supabase';

interface RequestDetailModalProps {
  request: CompanyRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  if (!isOpen || !request) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{request.company_name}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Company Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Company Information</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={request.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {request.company_website}
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium text-gray-900">{request.industry}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Company Size</p>
                  <p className="font-medium text-gray-900">{request.company_size}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Domains</p>
                  <div className="flex flex-wrap gap-2">
                    {request.email_domains.map((domain, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        @{domain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          {request.description && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Description</span>
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{request.description}</p>
            </section>
          )}

          {/* Justification */}
          {request.justification && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span>Justification</span>
              </h3>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {request.justification}
              </p>
            </section>
          )}

          {/* Request Metadata */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Request ID</span>
                <span className="text-sm font-mono text-gray-900">{request.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Submitted</span>
                <span className="text-sm text-gray-900">{formatDate(request.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requester Hash</span>
                <span className="text-sm font-mono text-gray-900">{request.requester_hash.slice(0, 16)}...</span>
              </div>
            </div>
          </section>

          {/* Review Information (if reviewed) */}
          {request.status !== 'pending' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Review Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {request.reviewed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviewed At</span>
                    <span className="text-sm text-gray-900">{formatDate(request.reviewed_at)}</span>
                  </div>
                )}
                {request.reviewed_by && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reviewed By</span>
                    <span className="text-sm text-gray-900">{request.reviewed_by}</span>
                  </div>
                )}
                {request.admin_notes && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-900">{request.admin_notes}</p>
                  </div>
                )}
                {request.rejection_reason && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700 bg-red-50 p-3 rounded">{request.rejection_reason}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
