# Truplace - Product Description

## Overview

Truplace is a comprehensive workplace review platform that empowers professionals to share anonymous, authentic reviews about their employers. The platform creates transparency in the job market by allowing current and former employees to rate companies across multiple dimensions, helping job seekers make informed career decisions.

## Core Value Proposition

**"Anonymous Reviews. Real Insights."**

Truplace bridges the information gap between job seekers and employers by providing:
- **100% Anonymous Reviews**: Employees can share honest feedback without fear of retaliation
- **Verified Authenticity**: Email verification ensures reviews come from real people
- **Multi-Dimensional Insights**: Companies are rated across 9 key workplace dimensions
- **Community-Driven**: Thousands of company reviews help create a transparent job market

## Target Audience

### Primary Users
- **Job Seekers**: Professionals researching potential employers before accepting offers
- **Current Employees**: Workers wanting to share their workplace experiences anonymously
- **Career Switchers**: Individuals comparing companies and industries for career transitions

### Secondary Users
- **HR Professionals**: Teams seeking competitive intelligence and employer branding insights
- **Recruiters**: Professionals understanding candidate concerns about specific employers
- **Company Leadership**: Executives tracking their employer reputation and employee sentiment

## Key Features

### 1. Anonymous Review System
- Passwordless authentication via magic link email verification
- Complete anonymity in published reviews
- Protection of reviewer identity from employers
- User authentication tied to verified email addresses

### 2. Comprehensive Company Search
- Real-time search with auto-suggestions
- Search by company name with instant results
- Browse by industry categories
- Filter companies by size, industry, and ratings
- Popular companies showcase for quick discovery

### 3. Multi-Dimensional Rating System
Reviews evaluate companies across 9 critical dimensions:
- **Compensation & Benefits**: Salary, bonuses, health insurance, and perks
- **Management Quality**: Leadership effectiveness and managerial support
- **Culture, Values & Inclusion**: Company values, diversity, and inclusive environment
- **Career Opportunities & Development**: Growth potential and learning opportunities
- **Recognition & Appreciation**: How well contributions are acknowledged
- **Working Environment**: Office space, tools, and remote/physical work setup
- **Work-Life Balance**: Flexible hours, vacation policy, and stress levels
- **Cooperation & Relationships**: Teamwork and colleague relationships
- **Business Health & Outlook**: Company stability, financial health, and future prospects

### 4. Detailed Company Profiles
Each company profile includes:
- Overall rating (1-5 stars)
- Total review count
- Recommendation rate (% who would recommend)
- Average ratings for all 9 dimensions
- Visual charts and statistics
- Recent reviews with detailed feedback
- Company size and industry information
- Filter and sort reviews by rating, date, or recommendation

### 5. Review Submission Flow
- Guided step-by-step review form
- Progress tracking with visual progress bar
- Company search and selection
- Star ratings (1-5) for each dimension
- Text feedback for specific insights (up to 500 characters per dimension)
- Overall recommendation (Highly Recommend / Maybe / Not Recommended)
- Friend advice section for final thoughts
- Review preview before submission
- Auto-save functionality to prevent data loss

### 6. Company Request System
- Users can request companies not yet in the database
- Submit company details: name, website, email domains
- Provide industry and size information
- Add justification for why the company should be added
- Duplicate detection to prevent redundant requests
- Auto-populate email domain from user's verified email
- Admin review workflow for approvals
- Notification system when requested companies are added

### 7. Data Visualization & Analytics
- Pie charts showing recommendation distribution
- Bar charts for dimensional rating breakdowns
- Rating distribution histograms
- Trend indicators and statistics
- Comparison tables across rating dimensions
- Aggregated metrics and insights

### 8. Browse & Discovery
- Browse all companies with search and filters
- Filter by industry, company size, and rating
- Sort by most reviewed, highest rated, or newest
- Company cards with key metrics
- Quick navigation to company profiles

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router for navigation
- **Icons**: Lucide React for consistent iconography
- **Charts**: Recharts for data visualization

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with magic link email verification
- **Storage**: Cloud-based data persistence
- **Security**: Row Level Security (RLS) policies

### Database Schema

#### Companies Table
- Unique company names
- Industry and size classification
- Logo URLs (optional)
- Timestamps for tracking

#### Reviews Table
- Linked to companies via foreign keys
- Authenticated user references (anonymous in display)
- Overall rating (1-5 scale)
- Recommendation type
- Optional role/position
- Pros and cons arrays
- Additional advice text
- JSONB dimensions object for 9 ratings
- Helpful count for community engagement
- Creation timestamp

#### Company Stats View
- Materialized aggregated statistics
- Average ratings across all dimensions
- Review counts
- Recommendation percentages
- Performance optimized for queries

#### Company Requests Table
- User-submitted company additions
- Approval workflow status
- Company details and justification
- Admin review metadata

#### Notifications Table
- User notification system
- Read/unread status tracking
- Multiple notification types
- Timestamp management

## User Experience Flow

### New User Journey
1. **Discovery**: Land on homepage with hero search
2. **Browse**: Search or browse companies
3. **Learn**: View company profiles and reviews
4. **Engage**: Click to submit a review
5. **Verify**: Verify email via magic link
6. **Create**: Complete review form with ratings and feedback
7. **Preview**: Review submission before publishing
8. **Publish**: Submit anonymous review
9. **Redirect**: View published review on company profile

### Returning User Journey
1. **Quick Access**: Auto-authenticated via session
2. **Direct Action**: Navigate directly to review submission
3. **Find Company**: Search and select company
4. **Rate & Review**: Complete review form
5. **Publish**: Submit with one click

### Company Request Flow
1. **Discovery Gap**: User can't find their company
2. **Request Form**: Click "Request Company" in navigation
3. **Authentication**: Verify email if not logged in
4. **Fill Details**: Complete company information form
5. **Duplicate Check**: System detects potential duplicates
6. **Submit**: Request sent to admin queue
7. **Notification**: User notified when company is added

## Security & Privacy

### Data Protection
- Email verification required for all reviewers
- Personal email domains accepted (testing configuration)
- No personally identifiable information in reviews
- Reviews linked to user IDs but displayed anonymously
- RLS policies prevent unauthorized data access

### Review Integrity
- One review per user per company (configurable)
- Email verification prevents spam accounts
- Required ratings ensure complete feedback
- Character limits prevent abuse
- User authentication prevents bot submissions

### Access Control
- Public read access for all reviews and companies
- Authenticated write access for reviews
- User can only update their own reviews
- Admin controls for company requests

## Future Enhancement Opportunities

### Short-Term
- Email notifications when reviews receive helpful votes
- Ability to mark reviews as helpful
- Company comparison side-by-side view
- Filter reviews by role/department
- Time-based review filtering (Q1, Q2, etc.)

### Medium-Term
- Company claim and verification system
- Employer response to reviews
- Verified employee badges
- Salary information integration
- Interview questions and processes
- Mobile app development

### Long-Term
- Advanced analytics dashboard
- Industry benchmarking reports
- AI-powered review summaries
- Multilingual support
- Integration with job boards
- Premium features for HR teams
- Company culture scores and certifications

## Success Metrics

### User Engagement
- Number of registered users
- Reviews submitted per week
- Average time on company profiles
- Search queries performed
- Company request submissions

### Content Quality
- Average review length
- Percentage of complete reviews (all dimensions rated)
- Review helpfulness ratings
- Duplicate company detection accuracy

### Platform Growth
- Total companies in database
- Reviews per company average
- Industry coverage breadth
- User retention rate
- Monthly active users

## Competitive Advantages

1. **Comprehensive Rating System**: 9-dimensional ratings vs. single overall score
2. **True Anonymity**: No username displays, complete privacy
3. **Verified Authenticity**: Email verification without restricting access
4. **User-Driven Database**: Community can request companies
5. **Clean, Modern UI**: Beautiful, production-ready design
6. **Fast Performance**: Optimized queries and caching
7. **Mobile-Responsive**: Works seamlessly across all devices

## Business Model Considerations

### Potential Revenue Streams
- Premium employer accounts with response capabilities
- Featured company listings
- Recruitment partnerships
- HR analytics subscriptions
- API access for data partners
- Anonymous verification services for enterprises

### Freemium Model
- Free: Browse all reviews, submit reviews, basic search
- Premium Individual: Save companies, comparison tools, alerts
- Premium Employer: Response to reviews, analytics dashboard
- Enterprise: Custom integrations, bulk data access

## Brand Identity

### Visual Design
- Clean, professional aesthetic
- Blue and green gradient accents (trust and growth)
- Ample white space for readability
- Card-based layouts for content hierarchy
- Modern typography and iconography
- Mobile-first responsive design

### Voice & Tone
- Professional yet approachable
- Empowering and supportive
- Transparent and honest
- Community-focused
- Action-oriented

### Trust Indicators
- "100% Anonymous" badge
- "Verified Reviews" indicator
- "Thousands of Companies" showcase
- Clear privacy policies
- Secure authentication messaging

## Testing & Development

### Testing Mode
For local development and testing, email verification can be bypassed:

**Enable Testing Mode:**
```
VITE_DISABLE_AUTH_FOR_TESTING=true
```

**Features:**
- Bypasses email verification completely
- Auto-creates test user (ID: `test-user-123`)
- Direct access to review submission
- Yellow banner indicating testing mode
- Console warnings when active

**Cleanup:**
```sql
DELETE FROM reviews WHERE user_id = 'test-user-123';
```

This feature streamlines development and QA testing without compromising production security.

## Conclusion

Truplace fills a critical need in the modern job market by providing authentic, anonymous workplace insights. The platform's comprehensive 9-dimensional rating system, combined with strong privacy protections and a beautiful user experience, positions it as a valuable resource for both job seekers and employers. With its scalable architecture and community-driven content model, Truplace is poised to become the go-to platform for workplace transparency.
