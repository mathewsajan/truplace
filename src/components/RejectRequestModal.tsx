import React, { useState } from 'react';
import { X, XCircle, AlertCircle } from 'lucide-react';
import { CompanyRequest } from '../lib/supabase';

interface RejectRequestModalProps {
  request: CompanyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string, rejectionReason: string, adminNotes?: string) => Promise<void>;
}

const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonReasons = [
    'Company already exists in database',
    'Insufficient information provided',
    'Not a valid company',
    'Duplicate request',
    'Unable to verify company legitimacy'
  ];

  if (!isOpen || !request) return null;

  const handleConfirm = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (rejectionReason.trim().length < 20) {
      setError('Rejection reason must be at least 20 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(request.id, rejectionReason.trim(), adminNotes.trim() || undefined);
      setRejectionReason('');
      setAdminNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRejectionReason('');
      setAdminNotes('');
      setError(null);
      onClose();
    }
  };

  const selectCommonReason = (reason: string) => {
    setRejectionReason(reason);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Reject Company Request</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              You are about to reject the request to add:
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-bold text-gray-900 text-lg mb-1">{request.company_name}</p>
              <p className="text-sm text-gray-600">{request.company_website}</p>
              <p className="text-sm text-gray-600 mt-1">
                {request.industry} • {request.company_size}
              </p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-2">What will happen:</p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Company will NOT be added to the database</li>
              <li>Request status will be marked as rejected</li>
              <li>Requester will receive a rejection email with your reason</li>
            </ul>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select Common Reasons
            </label>
            <div className="flex flex-wrap gap-2">
              {commonReasons.map((reason, index) => (
                <button
                  key={index}
                  onClick={() => selectCommonReason(reason)}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    rejectionReason === reason
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                setError(null);
              }}
              placeholder="Explain why this request is being rejected. This will be sent to the requester."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {rejectionReason.length}/1000 characters (minimum 20 required)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any internal notes about this rejection (not sent to requester)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={2}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {adminNotes.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectRequestModal;
