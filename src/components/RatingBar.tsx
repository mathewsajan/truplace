import React from 'react';

interface RatingBarProps {
  title: string;
  rating: number;
  reviewCount: number;
  maxRating?: number;
}

const RatingBar: React.FC<RatingBarProps> = ({ 
  title, 
  rating, 
  reviewCount, 
  maxRating = 5 
}) => {
  const percentage = (rating / maxRating) * 100;
  
  const getBarColor = (rating: number) => {
    if (rating >= 3.5) return 'bg-green-500';
    if (rating >= 2.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBackgroundColor = (rating: number) => {
    if (rating >= 3.5) return 'bg-green-100';
    if (rating >= 2.5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({reviewCount})
            </span>
          </div>
        </div>
        <div className={`w-full h-2 ${getBackgroundColor(rating)} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${getBarColor(rating)} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RatingBar;