import React from 'react';

interface ProgressBarProps {
  progress: number;
  title: string;
  subtitle?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, title, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</span>
          <p className="text-sm text-gray-500">Complete</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;