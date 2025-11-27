import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Mail } from 'lucide-react';
import { DomainInputProps } from '../types/companyRequest';

const DomainInput: React.FC<DomainInputProps> = ({ 
  domains, 
  onChange, 
  error, 
  placeholder = "Enter email domain" 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    if (inputValue) {
      setIsValid(domainRegex.test(inputValue));
    } else {
      setIsValid(true);
    }
  }, [inputValue]);

  const addDomain = () => {
    const trimmedValue = inputValue.trim().toLowerCase();
    
    if (!trimmedValue) return;
    
    if (!domainRegex.test(trimmedValue)) {
      setIsValid(false);
      return;
    }
    
    if (domains.includes(trimmedValue)) {
      setInputValue('');
      return;
    }
    
    onChange([...domains, trimmedValue]);
    setInputValue('');
    setIsValid(true);
  };

  const removeDomain = (domainToRemove: string) => {
    onChange(domains.filter(domain => domain !== domainToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addDomain();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedDomains = pastedText
      .split(/[,\s\n]+/)
      .map(domain => domain.trim().toLowerCase())
      .filter(domain => domain && domainRegex.test(domain))
      .filter(domain => !domains.includes(domain));
    
    if (pastedDomains.length > 0) {
      onChange([...domains, ...pastedDomains]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Domain Tags */}
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <div
              key={domain}
              className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <Mail className="w-3 h-3" />
              <span>{domain}</span>
              <button
                type="button"
                onClick={() => removeDomain(domain)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              error || !isValid 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          />
          {!isValid && inputValue && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={addDomain}
          disabled={!inputValue.trim() || !isValid}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-500">
        Enter email domains (e.g., company.com). Press Enter or comma to add multiple domains.
      </p>
    </div>
  );
};

export default DomainInput;