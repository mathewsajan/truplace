import React from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ReviewCardProps {
  rating: number;
  recommendation: 'highly-recommend' | 'maybe' | 'not-recommended';
  excerpt: string;
  role: string;
  period: string;
  pros?: string[];
  cons?: string[];
  helpfulCount?: number;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  rating,
  recommendation,
  excerpt,
  role,
  period,
  pros = [],
  cons = [],
  helpfulCount = 0
}) => {
  const getRecommendationBadge = () => {
    switch (recommendation) {
      case 'highly-recommend':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Highly Recommend
          </span>
        );
      case 'maybe':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            🤔 Maybe
          </span>
        );
      case 'not-recommended':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Not Recommended
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            {renderStars(rating)}
          </div>
          <span className="text-sm font-medium text-gray-900">{rating}.0</span>
        </div>
        {getRecommendationBadge()}
      </div>

      {/* Review Excerpt */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        "{excerpt}"
      </p>

      {/* Pros and Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {pros.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Pros</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {pros.map((pro, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-1">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {cons.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <ThumbsDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Cons</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {cons.map((con, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          <span className="font-medium">{role}</span> • {period}
        </div>
        <div className="text-sm text-gray-500">
          {helpfulCount} found this helpful
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;