import React from 'react';
import { Calendar, Globe, Building2, Users, ExternalLink, Eye, CheckCircle, XCircle } from 'lucide-react';
import { CompanyRequest } from '../lib/supabase';

interface RequestCardProps {
  request: CompanyRequest;
  onViewDetails: (request: CompanyRequest) => void;
  onApprove: (request: CompanyRequest) => void;
  onReject: (request: CompanyRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onViewDetails,
  onApprove,
  onReject
}) => {
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending'
      },
      approved: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Approved'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Rejected'
      }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{request.company_name}</h3>
            {getStatusBadge(request.status)}
          </div>
          <a
            href={request.company_website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <Globe className="w-4 h-4" />
            <span>{request.company_website}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4" />
          <span>{request.industry}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{request.company_size}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(request.created_at)}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">{request.email_domains.length}</span> email domain{request.email_domains.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Justification Preview */}
      {request.justification && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Justification:</p>
          <p className="text-sm text-gray-700 line-clamp-2">{request.justification}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onViewDetails(request)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>

        {request.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(request)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => onReject(request)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </>
        )}
      </div>

      {/* Review Info for non-pending requests */}
      {request.status !== 'pending' && request.reviewed_at && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Reviewed {formatDate(request.reviewed_at)}</span>
            {request.reviewed_by && <span>by {request.reviewed_by}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestCard;
