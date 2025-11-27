import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { IndustrySelectProps } from '../types/companyRequest';

const industries = [
  { value: 'Technology', label: 'Technology', keywords: ['tech', 'software', 'it', 'saas'] },
  { value: 'Finance', label: 'Finance & Banking', keywords: ['bank', 'financial', 'fintech', 'investment'] },
  { value: 'Healthcare', label: 'Healthcare & Medical', keywords: ['medical', 'pharma', 'biotech', 'health'] },
  { value: 'Manufacturing', label: 'Manufacturing', keywords: ['factory', 'production', 'industrial'] },
  { value: 'Retail', label: 'Retail & E-commerce', keywords: ['shopping', 'store', 'commerce', 'consumer'] },
  { value: 'Education', label: 'Education', keywords: ['school', 'university', 'learning', 'academic'] },
  { value: 'Government', label: 'Government & Public Sector', keywords: ['public', 'federal', 'state', 'municipal'] },
  { value: 'Non-Profit', label: 'Non-Profit', keywords: ['charity', 'foundation', 'ngo', 'social'] },
  { value: 'Consulting', label: 'Consulting', keywords: ['advisory', 'professional services', 'strategy'] },
  { value: 'Media', label: 'Media & Entertainment', keywords: ['news', 'publishing', 'entertainment', 'content'] },
  { value: 'Real Estate', label: 'Real Estate', keywords: ['property', 'construction', 'development'] },
  { value: 'Other', label: 'Other', keywords: [] }
];

const IndustrySelect: React.FC<IndustrySelectProps> = ({ value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredIndustries = industries.filter(industry =>
    industry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    industry.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (industryValue: string) => {
    onChange(industryValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedIndustry = industries.find(industry => industry.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex items-center justify-between ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={selectedIndustry ? 'text-gray-900' : 'text-gray-500'}>
          {selectedIndustry ? selectedIndustry.label : 'Select industry...'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search industries..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredIndustries.length > 0 ? (
              filteredIndustries.map((industry) => (
                <button
                  key={industry.value}
                  type="button"
                  onClick={() => handleSelect(industry.value)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-200 flex items-center justify-between"
                >
                  <span className="text-gray-900">{industry.label}</span>
                  {value === industry.value && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No industries found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySelect;