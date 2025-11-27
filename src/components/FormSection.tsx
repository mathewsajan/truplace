import React from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description, 
  children, 
  required = false 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {description && (
          <p className="text-gray-600 mt-2 leading-relaxed">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

export default FormSection;