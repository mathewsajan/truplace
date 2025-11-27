# Email Service Setup Guide (Brevo)

This guide walks you through setting up production email notifications for TruPlace using Brevo (formerly Sendinblue).

## Overview

TruPlace uses Brevo to send email notifications when:
- Company requests are approved (users receive a link to write their review)
- Company requests are rejected (users are notified with the reason)

The email service is implemented as a Supabase Edge Function (`send-email`) that's already deployed and ready to use.

---

## Step 1: Create Brevo Account

1. Go to [https://www.brevo.com](https://www.brevo.com)
2. Sign up for a free account (Free tier includes 300 emails/day)
3. Verify your email address
4. Complete the account setup wizard

---

## Step 2: Get Your API Key

1. Log in to your Brevo dashboard
2. Navigate to **SMTP & API** in the left sidebar
3. Click on **API Keys** tab
4. Click **Generate a new API key**
5. Give it a name like "TruPlace Production"
6. Copy the API key (you won't be able to see it again!)
7. Store it securely - you'll need it for the next steps

---

## Step 3: Verify Your Sender Email

### Option A: Use Brevo's Default Domain (Quick Start)
- Brevo provides a default sending domain
- Use an email like: `notifications@youraccount.smtp-brevo.com`
- No verification needed, but less professional

### Option B: Use Your Custom Domain (Recommended)
1. In Brevo dashboard, go to **Senders & IP**
2. Click **Add a sender**
3. Enter your email (e.g., `notifications@truplace.com`)
4. Brevo will send a verification email
5. Click the verification link in the email
6. Add DNS records to your domain:
   - **SPF Record**: Add to TXT records
   - **DKIM Record**: Add to TXT records
   - **DMARC Record**: Add to TXT records (optional but recommended)
7. Wait for DNS propagation (can take up to 48 hours)
8. Verify in Brevo dashboard that all records are active

Example DNS Records:
```
Type: TXT
Host: @
Value: v=spf1 include:spf.brevo.com ~all

Type: TXT
Host: mail._domainkey
Value: [Brevo will provide this]

Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@truplace.com
```

---

## Step 4: Configure Environment Variables

### For Local Development (.env file)

Update your `.env` file with the following:

```env
# Supabase Configuration (already set)
VITE_SUPABASE_ANON_KEY=your_existing_anon_key
VITE_SUPABASE_URL=your_existing_supabase_url

# Application URL (update for production)
VITE_APP_URL=http://localhost:5173

# Email Configuration (UPDATE THESE!)
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_SENDER_EMAIL=notifications@yourdomain.com
BREVO_SENDER_NAME=TruPlace Team

# Development/Testing Mode (set to false or remove for production)
VITE_DISABLE_AUTH_FOR_TESTING=false
```

### For Supabase Edge Function Secrets

The Edge Function needs access to these environment variables. Set them in Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Edge Functions** in the left sidebar
4. Click on the **send-email** function
5. Click **Settings** or **Secrets** tab
6. Add the following secrets:

```
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_SENDER_EMAIL=notifications@yourdomain.com
BREVO_SENDER_NAME=TruPlace Team
APP_URL=https://yourdomain.com
```

**Alternative Method (Using Supabase CLI):**
```bash
supabase secrets set BREVO_API_KEY=xkeysib-your-actual-api-key-here
supabase secrets set BREVO_SENDER_EMAIL=notifications@yourdomain.com
supabase secrets set BREVO_SENDER_NAME="TruPlace Team"
supabase secrets set APP_URL=https://yourdomain.com
```

---

## Step 5: Test Email Functionality

### Method 1: Test via Admin Dashboard

1. Start your development server: `npm run dev`
2. Navigate to the admin company requests page: `/admin/company-requests`
3. Create a test company request (or use an existing one)
4. Approve or reject the request
5. Check that the email was sent to the user's email address
6. Verify the email arrives in the recipient's inbox

### Method 2: Test Edge Function Directly

You can test the Edge Function directly using curl:

```bash
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipientEmail": "test@example.com",
    "recipientName": "Test User",
    "emailType": "company_approved",
    "companyName": "Test Company Inc.",
    "notificationToken": "test-token-123"
  }'
```

Expected successful response:
```json
{
  "success": true,
  "messageId": "some-message-id"
}
```

### Method 3: Check Brevo Dashboard

1. Go to Brevo dashboard
2. Navigate to **Statistics** > **Email**
3. You should see sent emails listed
4. Check delivery status, open rates, etc.

---

## Step 6: Monitor Email Delivery

### In Brevo Dashboard

1. **Statistics**: View delivery rates, opens, clicks
2. **Logs**: See detailed logs of all sent emails
3. **Blacklist**: Check if any emails are being blocked
4. **Webhooks**: Set up webhooks for delivery events (optional)

### Common Issues and Solutions

#### Emails Going to Spam
- Verify SPF, DKIM, and DMARC records are set up correctly
- Use a verified sender domain
- Avoid spam trigger words in email content
- Warm up your sending domain (send gradually increasing volumes)

#### Emails Not Sending
- Check Brevo API key is correct
- Verify sender email is verified in Brevo
- Check Supabase Edge Function logs for errors
- Verify environment variables are set correctly
- Check your Brevo account hasn't exceeded daily limits

#### Invalid API Key Error
- Make sure you copied the full API key
- API keys start with `xkeysib-`
- Regenerate a new API key if lost

---

## Step 7: Production Deployment

### Update Production Environment Variables

When deploying to production (Vercel, Netlify, etc.):

1. **In your hosting platform dashboard:**
   - Add `VITE_APP_URL=https://your-production-domain.com`
   - Add `VITE_DISABLE_AUTH_FOR_TESTING=false` (or remove it)
   - Keep `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_URL` as is

2. **In Supabase Dashboard:**
   - Update `APP_URL` secret to your production domain
   - Ensure `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, and `BREVO_SENDER_NAME` are set

### Update Email Templates (Optional)

If you want to customize the email templates, edit:
`/supabase/functions/send-email/index.ts`

The function includes two template functions:
- `getCompanyApprovedEmailTemplate()` - For approved company requests
- `getCompanyRejectedEmailTemplate()` - For rejected company requests

After making changes, redeploy the Edge Function (it auto-deploys when you push changes).

---

## Email Rate Limits

### Brevo Free Tier
- 300 emails per day
- Unlimited contacts
- Basic email features

### Brevo Paid Tiers
- Lite: $25/month - 10,000 emails/month
- Business: $65/month - 20,000 emails/month
- Enterprise: Custom pricing

**Recommendation**: Start with the free tier and upgrade when you exceed 300 emails/day.

---

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.env` file (already in `.gitignore`)
   - Use environment variables in production

2. **Use environment-specific keys**
   - Development API key for local testing
   - Production API key for live environment

3. **Rotate API keys regularly**
   - Generate new keys every 6-12 months
   - Update in all environments

4. **Monitor usage**
   - Set up alerts in Brevo for unusual activity
   - Check logs regularly for failed sends

---

## Troubleshooting

### Check Edge Function Logs

```bash
# Using Supabase CLI
supabase functions logs send-email

# Or in Supabase Dashboard
# Go to Edge Functions > send-email > Logs
```

### Test Environment Variables

Add this to your Edge Function temporarily:

```typescript
console.log("BREVO_API_KEY exists:", !!Deno.env.get("BREVO_API_KEY"));
console.log("BREVO_SENDER_EMAIL:", Deno.env.get("BREVO_SENDER_EMAIL"));
console.log("APP_URL:", Deno.env.get("APP_URL"));
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required environment variables" | Environment variables not set | Set BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME |
| "Invalid API key" | Wrong or expired API key | Generate new API key in Brevo dashboard |
| "Sender email not verified" | Sender email not verified in Brevo | Verify sender email in Brevo dashboard |
| "Daily limit exceeded" | Free tier limit reached | Upgrade Brevo plan or wait until tomorrow |
| "HTTP 401" | Authentication failed | Check API key is correct |
| "HTTP 400" | Invalid request format | Check email payload structure |

---

## Support

- **Brevo Support**: [https://help.brevo.com](https://help.brevo.com)
- **Supabase Edge Functions Docs**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- **TruPlace Support**: support@truplace.com

---

## Quick Reference

### Brevo API Endpoint
```
POST https://api.brevo.com/v3/smtp/email
```

### Required Headers
```
Accept: application/json
Content-Type: application/json
api-key: YOUR_API_KEY
```

### Edge Function Endpoint
```
POST https://your-project.supabase.co/functions/v1/send-email
```

### Environment Variables Checklist
- [ ] BREVO_API_KEY
- [ ] BREVO_SENDER_EMAIL
- [ ] BREVO_SENDER_NAME
- [ ] APP_URL (or VITE_APP_URL for frontend)
- [ ] VITE_DISABLE_AUTH_FOR_TESTING=false (production)

---

## Next Steps

After completing this setup:
1. ✅ Test email sending in development
2. ✅ Verify emails arrive and render correctly
3. ✅ Test both approval and rejection email flows
4. ✅ Configure production environment variables
5. ✅ Deploy to production
6. ✅ Monitor Brevo dashboard for delivery metrics
7. ✅ Set up email domain authentication (SPF/DKIM/DMARC)
8. ✅ Consider setting up Brevo webhooks for advanced monitoring

Your email service is now production-ready! 🎉
