import React from 'react';
import { User, ShieldCheck, Edit } from 'lucide-react';
import EmailVerificationModal from './EmailVerificationModal';

const HowItWorks = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const steps = [
    {
      number: '1',
      title: 'Join the Platform',
      description: 'Sign up using work email for authenticity',
      icon: User,
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '2',
      title: 'Verify Your Work Email',
      description: 'Quick verification for real employees',
      icon: ShieldCheck,
      color: 'from-green-500 to-green-600'
    },
    {
      number: '3',
      title: 'Submit Your Review',
      description: 'Share honest workplace experience anonymously',
      icon: Edit,
      color: 'from-purple-500 to-purple-600',
      clickable: true
    }
  ];

  const handleStepClick = (step: any) => {
    if (step.clickable) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Follow these three easy steps to share your workplace experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div 
                  key={index} 
                  className={`text-center group ${step.clickable ? 'cursor-pointer' : ''}`}
                  onClick={() => handleStepClick(step)}
                >
                  <div className="relative mb-6">
                    {/* Step Number */}
                    <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className={`text-gray-600 leading-relaxed ${step.clickable ? 'group-hover:text-gray-800' : ''}`}>
                    {step.description}
                  </p>

                  {/* Connector Line (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gray-300 transform -translate-y-1/2"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <EmailVerificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default HowItWorks;