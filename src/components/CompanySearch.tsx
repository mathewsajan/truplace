import React, { useState, useRef, useEffect } from 'react';
import { Search, Building2, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchCompanies } from '../lib/supabase';

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
}

interface CompanySearchProps {
  selectedCompany: Company | null;
  onCompanySelect: (company: Company) => void;
  placeholder?: string;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  selectedCompany,
  onCompanySelect,
  placeholder = "Search for your company..."
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (searchTerm.trim()) {
        setLoading(true);
        try {
          const results = await searchCompanies(searchTerm);
          setFilteredCompanies(results);
        } catch (error) {
          console.error('Error searching companies:', error);
          setFilteredCompanies([]);
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredCompanies([]);
      }
    };

    const debounceTimer = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  useEffect(() => {
    // Load initial popular companies when dropdown opens
    const loadInitialCompanies = async () => {
      if (isOpen && !searchTerm && filteredCompanies.length === 0) {
        setLoading(true);
        try {
          const results = await searchCompanies('');
          setFilteredCompanies(results.slice(0, 5));
        } catch (error) {
          console.error('Error loading companies:', error);
          // Fallback data
          setFilteredCompanies([
            { id: '1', name: 'Google', industry: 'Technology', size: '10000+' },
            { id: '2', name: 'Apple', industry: 'Technology', size: '10000+' },
            { id: '3', name: 'Microsoft', industry: 'Technology', size: '10000+' },
            { id: '4', name: 'Amazon', industry: 'E-commerce', size: '10000+' },
            { id: '5', name: 'Meta', industry: 'Technology', size: '10000+' }
          ]);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      loadInitialCompanies();
    } else {
      setFilteredCompanies([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCompanySelect = (company: Company) => {
    onCompanySelect(company);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Building2 className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={selectedCompany ? selectedCompany.name : searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-gray-500 text-center">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Searching companies...</p>
            </div>
          ) : filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleCompanySelect(company)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-500">{company.industry}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              <p>{searchTerm ? 'No companies found' : 'Start typing to search companies'}</p>
              {searchTerm && <p className="text-sm mt-1">Try a different search term</p>}
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => navigate('/request-company', { state: { fromReview: true, suggestedName: searchTerm } })}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-200 flex items-center justify-center space-x-2 text-blue-600 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Company not listed? Request to add it</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySearch;