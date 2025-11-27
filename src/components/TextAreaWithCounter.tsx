import React from 'react';

interface TextAreaWithCounterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  rows?: number;
  label?: string;
  required?: boolean;
}

const TextAreaWithCounter: React.FC<TextAreaWithCounterProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  rows = 4,
  label,
  required = false
}) => {
  const remainingChars = maxLength - value.length;
  const isNearLimit = remainingChars <= 50;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
            isOverLimit 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          }`}
        />
        <div className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${
          isOverLimit 
            ? 'text-red-600 bg-red-50' 
            : isNearLimit 
            ? 'text-orange-600 bg-orange-50' 
            : 'text-gray-500 bg-gray-50'
        }`}>
          {remainingChars} chars left
        </div>
      </div>
    </div>
  );
};

export default TextAreaWithCounter;