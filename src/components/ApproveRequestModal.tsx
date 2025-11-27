import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { CompanyRequest } from '../lib/supabase';
import IndustrySelect from './IndustrySelect';
import DomainInput from './DomainInput';

interface EditedCompanyDetails {
  company_name: string;
  company_website: string;
  email_domains: string[];
  industry: string;
  company_size: string;
}

interface ApproveRequestModalProps {
  request: CompanyRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string, adminNotes?: string, editedDetails?: EditedCompanyDetails) => Promise<void>;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<EditedCompanyDetails | null>(null);

  const companySizes = [
    { value: '1-50 employees', label: 'Startup/Small (1-50 employees)' },
    { value: '51-200 employees', label: 'Medium (51-200 employees)' },
    { value: '201-1000 employees', label: 'Large (201-1000 employees)' },
    { value: '1000+ employees', label: 'Enterprise (1000+ employees)' }
  ];

  useEffect(() => {
    if (request && isOpen) {
      setEditedDetails({
        company_name: request.company_name,
        company_website: request.company_website,
        email_domains: request.email_domains,
        industry: request.industry,
        company_size: request.company_size
      });
    }
  }, [request, isOpen]);

  if (!isOpen || !request || !editedDetails) return null;

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const hasChanges = editedDetails.company_name !== request.company_name ||
        editedDetails.company_website !== request.company_website ||
        editedDetails.industry !== request.industry ||
        editedDetails.company_size !== request.company_size ||
        JSON.stringify(editedDetails.email_domains) !== JSON.stringify(request.email_domains);

      await onConfirm(
        request.id,
        adminNotes.trim() || undefined,
        hasChanges ? editedDetails : undefined
      );
      setAdminNotes('');
      setIsEditing(false);
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
      setIsEditing(false);
      onClose();
    }
  };

  const hasChanges = editedDetails.company_name !== request.company_name ||
    editedDetails.company_website !== request.company_website ||
    editedDetails.industry !== request.industry ||
    editedDetails.company_size !== request.company_size ||
    JSON.stringify(editedDetails.email_domains) !== JSON.stringify(request.email_domains);

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
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700">
                {isEditing ? 'Edit company details before approval:' : 'You are about to approve the request to add:'}
              </p>
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSubmitting}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Details'}</span>
              </button>
            </div>

            {!isEditing ? (
              <div className={`border rounded-lg p-4 ${
                hasChanges ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200'
              }`}>
                {hasChanges && (
                  <div className="mb-2 flex items-center space-x-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">Modified from original request</p>
                  </div>
                )}
                <p className="font-bold text-gray-900 text-lg mb-1">{editedDetails.company_name}</p>
                <p className="text-sm text-gray-600">{editedDetails.company_website}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {editedDetails.industry} • {editedDetails.company_size}
                </p>
                {editedDetails.email_domains.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Email domains: {editedDetails.email_domains.join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editedDetails.company_name}
                    onChange={(e) => setEditedDetails({...editedDetails, company_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={editedDetails.company_website}
                    onChange={(e) => setEditedDetails({...editedDetails, company_website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <IndustrySelect
                    value={editedDetails.industry}
                    onChange={(value) => setEditedDetails({...editedDetails, industry: value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <select
                    value={editedDetails.company_size}
                    onChange={(e) => setEditedDetails({...editedDetails, company_size: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  >
                    {companySizes.map(size => (
                      <option key={size.value} value={size.value}>{size.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Domains
                  </label>
                  <DomainInput
                    domains={editedDetails.email_domains}
                    onChange={(domains) => setEditedDetails({...editedDetails, email_domains: domains})}
                  />
                </div>
              </div>
            )}
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
