import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import PopularCompanies from '../components/PopularCompanies';

const LandingPage = () => {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <PopularCompanies />
    </main>
  );
};

export default LandingPage;