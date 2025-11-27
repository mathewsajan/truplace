import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { FormFieldProps } from '../types/companyRequest';

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required = false, 
  error, 
  children, 
  helpText 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {helpText && (
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              {helpText}
            </div>
          </div>
        )}
      </div>
      
      {children}
      
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;