# Brevo Email Integration Deployment Guide

This guide explains how to deploy the Brevo email sending system for TruPlace.

## Prerequisites

1. Brevo account with API key
2. Supabase CLI installed (`npm install -g supabase`)
3. Verified sender email in Brevo

## Configuration Steps

### 1. Update Environment Variables

Update your `.env` file with your actual Brevo credentials:

```bash
BREVO_API_KEY=your_actual_brevo_api_key_here
BREVO_SENDER_EMAIL=notifications@truplace.com  # Your verified email
BREVO_SENDER_NAME=TruPlace Team
VITE_APP_URL=https://yourdomain.com  # Your production URL
```

### 2. Deploy the Edge Function

The Edge Function for sending emails is located at `supabase/functions/send-email/`.

#### Deploy using Supabase CLI:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set Edge Function secrets (environment variables)
supabase secrets set BREVO_API_KEY=your_actual_brevo_api_key_here
supabase secrets set BREVO_SENDER_EMAIL=notifications@truplace.com
supabase secrets set BREVO_SENDER_NAME="TruPlace Team"
supabase secrets set APP_URL=https://yourdomain.com

# Deploy the function
supabase functions deploy send-email
```

#### Alternative: Deploy using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Click "Deploy new function"
4. Upload the contents of `supabase/functions/send-email/`
5. Set the environment variables in the function settings:
   - `BREVO_API_KEY`
   - `BREVO_SENDER_EMAIL`
   - `BREVO_SENDER_NAME`
   - `APP_URL`

### 3. Verify Sender Email in Brevo

1. Login to your Brevo account
2. Go to Settings > Senders & IP
3. Add and verify your sender email address
4. Wait for verification to complete

### 4. Test the Email Flow

1. Create a test company request
2. Approve it from the admin panel
3. Check that the email is sent successfully
4. Verify the notification link works correctly

## Email Templates

The system includes two email templates:

### Company Approved Email
- Subject: "Great News! {CompanyName} has been added to TruPlace"
- Contains: Welcome message, company name, CTA button to write review
- Link: `{APP_URL}/notification/{token}`

### Company Rejected Email
- Subject: "Update on Your Company Request - {CompanyName}"
- Contains: Rejection message, reason, link to request another company
- Link: `{APP_URL}/request-company`

## Troubleshooting

### Emails not sending
1. Check Edge Function logs in Supabase dashboard
2. Verify BREVO_API_KEY is correct
3. Ensure sender email is verified in Brevo
4. Check Brevo API quota/limits

### Notification links not working
1. Verify APP_URL is set correctly
2. Check that notification tokens are being generated
3. Ensure notification expiry is set correctly (7 days)

### CORS errors
1. Verify corsHeaders are properly set in Edge Function
2. Check that all response objects include CORS headers

## Monitoring

Monitor email delivery through:
1. Supabase Edge Function logs
2. Brevo dashboard (Statistics > Email)
3. Application console logs for errors

## Security Notes

- Never commit real API keys to version control
- Use environment variables for all sensitive data
- Sender email must be verified to prevent spam
- Notification tokens expire after 7 days
- User emails are stored securely in database

## Support

For issues:
- Check Supabase Edge Function logs
- Review Brevo API documentation: https://developers.brevo.com/
- Contact support@truplace.com
