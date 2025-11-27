import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { getCompanies } from '../lib/supabase';

const PopularCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getCompanies();
        const topCompanies = data.slice(0, 6).map((company: any, index: number) => {
          const colors = ['bg-blue-600', 'bg-gray-800', 'bg-blue-500', 'bg-orange-500', 'bg-red-600', 'bg-red-500'];
          return {
            id: company.id,
            name: company.name,
            rating: company.overall_rating,
            reviews: company.review_count,
            color: colors[index % colors.length],
            letter: company.name.charAt(0)
          };
        });
        setCompanies(topCompanies);
      } catch (error) {
        console.error('Error fetching companies:', error);
        // Set fallback data if Supabase fails
        setCompanies([
          { id: '1', name: 'Google', rating: 4.3, reviews: 1247, color: 'bg-blue-600', letter: 'G' },
          { id: '2', name: 'Apple', rating: 4.1, reviews: 892, color: 'bg-gray-800', letter: 'A' },
          { id: '3', name: 'Microsoft', rating: 4.2, reviews: 756, color: 'bg-blue-500', letter: 'M' },
          { id: '4', name: 'Amazon', rating: 3.6, reviews: 2156, color: 'bg-orange-500', letter: 'A' },
          { id: '5', name: 'Meta', rating: 3.9, reviews: 642, color: 'bg-red-600', letter: 'M' },
          { id: '6', name: 'Netflix', rating: 4.0, reviews: 423, color: 'bg-red-500', letter: 'N' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  const handleCompanyClick = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Companies
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover what employees are saying about these top companies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            companies.map((company: any, index: number) => (
            <div
              key={company.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => handleCompanyClick(company.id)}
            >
              <div className="flex items-center space-x-4 mb-4">
                {/* Company Logo Placeholder */}
                <div className={`w-12 h-12 ${company.color} rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300`}>
                  {company.letter}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {company.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(company.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {company.rating.toFixed(1)}
                  </span>
                </div>

                {/* Review Count */}
                <p className="text-sm text-gray-500">
                  {company.reviews.toLocaleString()} reviews
                </p>

                {/* View Button */}
                <button 
                  className="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gradient-to-r hover:from-blue-600 hover:to-green-500 hover:text-white transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompanyClick(company.id);
                  }}
                >
                  View Reviews
                </button>
              </div>
            </div>
          ))
          )}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300">
            Browse All Companies
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularCompanies;