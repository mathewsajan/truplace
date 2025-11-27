import React, { useState, useEffect, useContext } from 'react';
import { X, Save, AlertCircle, Building2 } from 'lucide-react';
import { CompanyStats, updateCompany } from '../lib/supabase';
import IndustrySelect from './IndustrySelect';
import { ToastContext } from '../App';

interface CompanyEditModalProps {
  company: CompanyStats | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({
  company,
  isOpen,
  onClose,
  onComplete
}) => {
  const toast = useContext(ToastContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    logo_url: ''
  });

  const companySizes = [
    { value: '1-50 employees', label: 'Startup/Small (1-50 employees)' },
    { value: '51-200 employees', label: 'Medium (51-200 employees)' },
    { value: '201-1000 employees', label: 'Large (201-1000 employees)' },
    { value: '1000+ employees', label: 'Enterprise (1000+ employees)' }
  ];

  useEffect(() => {
    if (company && isOpen) {
      setFormData({
        name: company.name,
        industry: company.industry,
        size: company.size,
        logo_url: company.logo_url || ''
      });
      setError(null);
    }
  }, [company, isOpen]);

  if (!isOpen || !company) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Company name is required');
      }
      if (!formData.industry) {
        throw new Error('Industry is required');
      }
      if (!formData.size) {
        throw new Error('Company size is required');
      }

      await updateCompany(company.id, {
        name: formData.name.trim(),
        industry: formData.industry,
        size: formData.size,
        logo_url: formData.logo_url.trim() || undefined
      });

      toast?.addToast('Company updated successfully', 'success');
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  const hasChanges = formData.name !== company.name ||
    formData.industry !== company.industry ||
    formData.size !== company.size ||
    formData.logo_url !== (company.logo_url || '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Edit Company</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {company.review_count > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Heads up!</p>
                <p className="text-sm text-yellow-700">
                  This company has {company.review_count} review{company.review_count !== 1 ? 's' : ''}.
                  Changes will be reflected on the public company profile.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <IndustrySelect
                value={formData.industry}
                onChange={(value) => setFormData({...formData, industry: value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              >
                {companySizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Reviews:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {company.review_count}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Average Rating:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {company.overall_rating.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {new Date(company.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {new Date(company.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3 sticky bottom-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanges}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyEditModal;
