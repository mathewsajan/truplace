import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { CompanyRequest } from '../lib/supabase';

interface ApproveRequestModalProps {
  request: CompanyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string, adminNotes?: string) => Promise<void>;
}

const ApproveRequestModal: React.FC<ApproveRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(request.id, adminNotes.trim() || undefined);
      setAdminNotes('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAdminNotes('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Approve Company Request</h2>
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
              You are about to approve the request to add:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-bold text-gray-900 text-lg mb-1">{request.company_name}</p>
              <p className="text-sm text-gray-600">{request.company_website}</p>
              <p className="text-sm text-gray-600 mt-1">
                {request.industry} • {request.company_size}
              </p>
            </div>
          </div>

          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-2">What will happen:</p>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Company will be added to the database</li>
              <li>Request status will be marked as approved</li>
              <li>Requester will receive an approval email</li>
              <li>Requester can write their review</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any internal notes about this approval..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {adminNotes.length}/500 characters
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Approval</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRequestModal;
