import React from 'react';
import { Star, Building2 } from 'lucide-react';

interface CompanyComparison {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  recommendationRate: number;
  industry: string;
}

interface ComparisonTableProps {
  currentCompany: CompanyComparison;
  competitors: CompanyComparison[];
  industryAverage: {
    rating: number;
    recommendationRate: number;
  };
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  currentCompany,
  competitors,
  industryAverage
}) => {
  const allCompanies = [currentCompany, ...competitors];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCompanyLogo = (name: string) => {
    const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600'];
    const colorIndex = name.length % colors.length;
    
    return (
      <div className={`w-8 h-8 ${colors[colorIndex]} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
        {name.charAt(0)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Industry Comparison
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          See how this company compares to similar organizations
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overall Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recommend Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allCompanies.map((company, index) => (
              <tr 
                key={company.id} 
                className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getCompanyLogo(company.name)}
                    <div className="ml-3">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        {index === 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{company.industry}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(company.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {company.rating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.reviewCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${company.recommendationRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-900">
                      {company.recommendationRate}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Industry Average Row */}
            <tr className="bg-yellow-50 border-t-2 border-yellow-200">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    📊
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      Industry Average
                    </div>
                    <div className="text-sm text-gray-500">{currentCompany.industry}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(industryAverage.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {industryAverage.rating.toFixed(1)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                -
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${industryAverage.recommendationRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900">
                    {industryAverage.recommendationRate}%
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;