export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  logo?: string;
  overallRating: number;
  reviewCount: number;
  recommendationRate: number;
  lastUpdated: string;
  dimensions: {
    compensation: number;
    management: number;
    culture: number;
    career: number;
    recognition: number;
    environment: number;
    worklife: number;
    cooperation: number;
  };
  reviews: Review[];
  insights: {
    pros: string[];
    cons: string[];
    highlights: string[];
  };
  trends: {
    ratingTrend: 'up' | 'down' | 'stable';
    trendValue: string;
  };
}

export interface Review {
  id: string;
  rating: number;
  recommendation: 'highly-recommend' | 'maybe' | 'not-recommended';
  excerpt: string;
  role: string;
  period: string;
  pros: string[];
  cons: string[];
  helpfulCount: number;
  dimensions: {
    compensation: number;
    management: number;
    culture: number;
    career: number;
    recognition: number;
    environment: number;
    worklife: number;
    cooperation: number;
  };
}

export const mockCompanies: { [key: string]: Company } = {
  google: {
    id: 'google',
    name: 'Google',
    industry: 'Technology',
    size: '1000+ employees',
    overallRating: 4.3,
    reviewCount: 1247,
    recommendationRate: 87,
    lastUpdated: '2024-01-15',
    dimensions: {
      compensation: 4.6,
      management: 4.1,
      culture: 4.4,
      career: 4.2,
      recognition: 4.0,
      environment: 4.5,
      worklife: 3.8,
      cooperation: 4.3
    },
    reviews: [
      {
        id: '1',
        rating: 5,
        recommendation: 'highly-recommend',
        excerpt: 'Amazing company culture and incredible learning opportunities. The compensation is top-tier and the work-life balance has improved significantly.',
        role: 'Software Engineer',
        period: 'Q4 2023',
        pros: ['Excellent compensation', 'Great learning opportunities', 'Innovative projects'],
        cons: ['High pressure environment', 'Long hours during crunch'],
        helpfulCount: 23,
        dimensions: {
          compensation: 5,
          management: 4,
          culture: 5,
          career: 5,
          recognition: 4,
          environment: 5,
          worklife: 3,
          cooperation: 4
        }
      },
      {
        id: '2',
        rating: 4,
        recommendation: 'highly-recommend',
        excerpt: 'Great place to work with smart colleagues and challenging problems. Management could be more consistent across teams.',
        role: 'Product Manager',
        period: 'Q3 2023',
        pros: ['Smart colleagues', 'Challenging work', 'Good benefits'],
        cons: ['Inconsistent management', 'Bureaucracy'],
        helpfulCount: 18,
        dimensions: {
          compensation: 4,
          management: 3,
          culture: 4,
          career: 4,
          recognition: 4,
          environment: 4,
          worklife: 4,
          cooperation: 5
        }
      },
      {
        id: '3',
        rating: 3,
        recommendation: 'maybe',
        excerpt: 'Good company overall but the work-life balance can be challenging. Compensation is competitive but promotion process is unclear.',
        role: 'Data Scientist',
        period: 'Q2 2023',
        pros: ['Competitive pay', 'Interesting projects', 'Good team'],
        cons: ['Work-life balance', 'Unclear promotion criteria'],
        helpfulCount: 12,
        dimensions: {
          compensation: 4,
          management: 3,
          culture: 3,
          career: 2,
          recognition: 3,
          environment: 4,
          worklife: 2,
          cooperation: 4
        }
      }
    ],
    insights: {
      pros: ['Excellent compensation and benefits', 'Cutting-edge technology', 'Smart and talented colleagues', 'Great learning opportunities'],
      cons: ['High pressure environment', 'Work-life balance challenges', 'Bureaucracy and slow decision making', 'Inconsistent management quality'],
      highlights: [
        'Top-tier compensation packages with stock options',
        'Access to latest technology and tools',
        'Strong engineering culture and innovation focus'
      ]
    },
    trends: {
      ratingTrend: 'up',
      trendValue: '+0.2'
    }
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    industry: 'Technology',
    size: '1000+ employees',
    overallRating: 4.1,
    reviewCount: 892,
    recommendationRate: 82,
    lastUpdated: '2024-01-12',
    dimensions: {
      compensation: 4.4,
      management: 3.9,
      culture: 4.2,
      career: 3.8,
      recognition: 3.7,
      environment: 4.3,
      worklife: 3.6,
      cooperation: 4.0
    },
    reviews: [
      {
        id: '1',
        rating: 5,
        recommendation: 'highly-recommend',
        excerpt: 'Working at Apple is a dream come true. The attention to detail and quality is unmatched. Great benefits and compensation.',
        role: 'iOS Developer',
        period: 'Q4 2023',
        pros: ['Premium brand', 'Quality focus', 'Great benefits'],
        cons: ['High expectations', 'Secretive culture'],
        helpfulCount: 31,
        dimensions: {
          compensation: 5,
          management: 4,
          culture: 4,
          career: 4,
          recognition: 4,
          environment: 5,
          worklife: 3,
          cooperation: 4
        }
      },
      {
        id: '2',
        rating: 4,
        recommendation: 'highly-recommend',
        excerpt: 'Excellent company with strong values and commitment to quality. The work environment is inspiring but can be demanding.',
        role: 'Design Engineer',
        period: 'Q3 2023',
        pros: ['Quality focus', 'Inspiring work', 'Good compensation'],
        cons: ['Demanding environment', 'Limited flexibility'],
        helpfulCount: 19,
        dimensions: {
          compensation: 4,
          management: 4,
          culture: 5,
          career: 3,
          recognition: 3,
          environment: 4,
          worklife: 3,
          cooperation: 4
        }
      }
    ],
    insights: {
      pros: ['Premium brand reputation', 'Focus on quality and innovation', 'Competitive compensation', 'Beautiful work environments'],
      cons: ['High pressure and expectations', 'Secretive work culture', 'Limited work flexibility', 'Challenging work-life balance'],
      highlights: [
        'Working on products used by millions worldwide',
        'Strong focus on design and user experience',
        'Comprehensive benefits package'
      ]
    },
    trends: {
      ratingTrend: 'stable',
      trendValue: '0.0'
    }
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    industry: 'E-commerce',
    size: '1000+ employees',
    overallRating: 3.6,
    reviewCount: 2156,
    recommendationRate: 68,
    lastUpdated: '2024-01-18',
    dimensions: {
      compensation: 4.1,
      management: 3.2,
      culture: 3.4,
      career: 4.0,
      recognition: 3.1,
      environment: 3.5,
      worklife: 2.8,
      cooperation: 3.6
    },
    reviews: [
      {
        id: '1',
        rating: 4,
        recommendation: 'highly-recommend',
        excerpt: 'Fast-paced environment with lots of learning opportunities. Compensation is good but work-life balance can be challenging.',
        role: 'Software Development Engineer',
        period: 'Q4 2023',
        pros: ['Learning opportunities', 'Good compensation', 'Career growth'],
        cons: ['Work-life balance', 'High pressure', 'Long hours'],
        helpfulCount: 45,
        dimensions: {
          compensation: 4,
          management: 3,
          culture: 3,
          career: 5,
          recognition: 3,
          environment: 3,
          worklife: 2,
          cooperation: 3
        }
      },
      {
        id: '2',
        rating: 3,
        recommendation: 'maybe',
        excerpt: 'Great for career growth and learning, but the culture can be intense. Management quality varies significantly between teams.',
        role: 'Product Manager',
        period: 'Q3 2023',
        pros: ['Career opportunities', 'Learning', 'Innovation'],
        cons: ['Intense culture', 'Inconsistent management', 'Burnout risk'],
        helpfulCount: 28,
        dimensions: {
          compensation: 4,
          management: 2,
          culture: 3,
          career: 4,
          recognition: 2,
          environment: 3,
          worklife: 2,
          cooperation: 3
        }
      }
    ],
    insights: {
      pros: ['Excellent career growth opportunities', 'Competitive compensation', 'Innovation and scale', 'Learning opportunities'],
      cons: ['Poor work-life balance', 'High pressure culture', 'Inconsistent management', 'Risk of burnout'],
      highlights: [
        'Rapid career advancement opportunities',
        'Working at massive scale with global impact',
        'Strong focus on customer obsession'
      ]
    },
    trends: {
      ratingTrend: 'down',
      trendValue: '-0.1'
    }
  }
};

export const industryAverages = {
  Technology: {
    rating: 3.9,
    recommendationRate: 75
  },
  'E-commerce': {
    rating: 3.7,
    recommendationRate: 72
  }
};