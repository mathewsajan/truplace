import React from 'react';
import { AlertTriangle, Building2, ExternalLink, X } from 'lucide-react';
import { DuplicateWarningProps } from '../types/companyRequest';

const DuplicateWarning: React.FC<DuplicateWarningProps> = ({
  duplicates,
  onDismiss,
  onUseExisting,
  onContinueAnyway
}) => {
  if (duplicates.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 animate-slide-up">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-800">
              Similar companies found
            </h3>
            <button
              onClick={onDismiss}
              className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-yellow-700 mb-3">
            We found {duplicates.length} similar {duplicates.length === 1 ? 'company' : 'companies'} 
            that might match your request:
          </p>

          <div className="space-y-2 mb-4">
            {duplicates.slice(0, 3).map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 bg-white rounded-md border border-yellow-200"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    {company.industry && (
                      <p className="text-sm text-gray-600">{company.industry}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {Math.round(company.similarity * 100)}% match
                  </span>
                  <button
                    onClick={() => onUseExisting(company)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {duplicates.length > 3 && (
              <p className="text-sm text-yellow-700">
                ...and {duplicates.length - 3} more similar {duplicates.length - 3 === 1 ? 'company' : 'companies'}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onContinueAnyway}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
            >
              Continue with my request
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 border border-yellow-300 text-yellow-800 rounded-md hover:bg-yellow-100 transition-colors duration-200 text-sm font-medium"
            >
              Let me review these first
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarning;