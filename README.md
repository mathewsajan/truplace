# Truplace

**Anonymous Reviews. Real Insights.**

Truplace is a comprehensive workplace review platform that empowers professionals to share anonymous, authentic reviews about their employers. The platform creates transparency in the job market by allowing current and former employees to rate companies across multiple dimensions, helping job seekers make informed career decisions.

## Key Features

- **100% Anonymous Reviews**: Employees can share honest feedback without fear of retaliation
- **Multi-Dimensional Ratings**: Companies rated across 8 key workplace dimensions including compensation, management, culture, work-life balance, and more
- **Company Search & Discovery**: Real-time search with auto-suggestions, browse by industry, and filter by ratings
- **Detailed Company Profiles**: View aggregated statistics, ratings, and authentic employee reviews
- **Company Request System**: Users can request companies not yet in the database
- **Data Visualization**: Interactive charts showing rating distributions and trends
- **Email Verification**: Passwordless authentication ensures reviews come from real people

## Tech Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Routing**: React Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with email verification
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/truplace.git
cd truplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Copy the example file and configure:
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up email service (optional but recommended):
See **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** for detailed instructions on configuring Brevo email notifications.

5. Run database migrations:
The database schema includes tables for companies, reviews, company requests, and notifications. Migrations are located in `supabase/migrations/`.

6. Start the development server:
```bash
npm run dev
```

7. Build for production:
```bash
npm run build
```

## Testing Mode

For local development and testing, you can bypass email verification:

### Enable Testing Mode
Set the following environment variable in `.env`:
```
VITE_DISABLE_AUTH_FOR_TESTING=true
```

Then restart the dev server.

### What Testing Mode Does
- Bypasses email verification completely
- Auto-creates a test user (ID: `test-user-123`)
- Redirects directly to review submission form
- Shows yellow banner indicating testing mode is active
- Console warning displayed when active

### Disable Testing Mode
Remove or set to false in `.env`:
```
VITE_DISABLE_AUTH_FOR_TESTING=false
```

### Cleanup Test Data
To remove test reviews from the database:
```sql
DELETE FROM reviews WHERE user_id = 'test-user-123';
```

## Project Structure

```
truplace/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configuration
│   ├── types/            # TypeScript type definitions
│   ├── data/             # Mock data and constants
│   └── main.tsx          # Application entry point
├── supabase/
│   └── migrations/       # Database migration files
└── public/               # Static assets
```

## Database Schema

### Core Tables
- **companies**: Company information, industry, size
- **reviews**: Anonymous employee reviews with 8-dimensional ratings
- **company_requests**: User-submitted company addition requests
- **notifications**: User notification system

### Key Dimensions Rated
1. Compensation & Benefits
2. Management Quality
3. Culture, Values & Inclusion
4. Career Opportunities & Development
5. Recognition & Appreciation
6. Working Environment
7. Work-Life Balance
8. Cooperation & Relationships
9. Business Health & Outlook

## Email Notifications Setup

TruPlace uses Brevo (formerly Sendinblue) to send email notifications for company request approvals and rejections.

### Quick Setup

1. Create a Brevo account at [https://www.brevo.com](https://www.brevo.com)
2. Get your API key from the Brevo dashboard
3. Configure environment variables in `.env`:
   ```
   BREVO_API_KEY=your_api_key_here
   BREVO_SENDER_EMAIL=notifications@yourdomain.com
   BREVO_SENDER_NAME=TruPlace Team
   ```
4. Set Supabase Edge Function secrets (see below)

### Detailed Guides

- **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** - Complete email service setup walkthrough
- **[SUPABASE_SECRETS_SETUP.md](./SUPABASE_SECRETS_SETUP.md)** - Quick guide for setting Supabase secrets

The `send-email` Edge Function is already deployed and ready to use once you configure the credentials.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**For detailed product information, see [PRODUCT_DESCRIPTION.md](./PRODUCT_DESCRIPTION.md)**
