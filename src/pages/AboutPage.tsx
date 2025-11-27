import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Truplace
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            We're on a mission to create transparency in the workplace by providing 
            a platform for honest, anonymous employee reviews.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To empower professionals with authentic workplace insights, helping them 
              make informed career decisions while encouraging companies to create 
              better work environments through transparency and accountability.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why We Exist</h2>
            <p className="text-gray-600 leading-relaxed">
              Job seekers deserve to know what they're signing up for. By providing 
              anonymous reviews, we help create a more transparent job market where 
              both employers and employees can thrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;