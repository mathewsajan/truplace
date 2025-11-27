# Email Service Setup Checklist

Use this checklist to ensure your email service is properly configured for production.

---

## Pre-Setup (5 minutes)

- [ ] Create Brevo account at [https://www.brevo.com](https://www.brevo.com)
- [ ] Verify your email address
- [ ] Complete Brevo account setup wizard

---

## Get API Credentials (5 minutes)

- [ ] Log in to Brevo dashboard
- [ ] Navigate to **SMTP & API** → **API Keys**
- [ ] Generate new API key named "TruPlace Production"
- [ ] Copy and securely store the API key (starts with `xkeysib-`)
- [ ] ⚠️ Save the key now - you won't see it again!

---

## Verify Sender Email (15-30 minutes)

### Option A: Quick Start (Immediate)
- [ ] Use Brevo's default domain
- [ ] Use email format: `notifications@youraccount.smtp-brevo.com`
- [ ] Skip to next section

### Option B: Custom Domain (Recommended for Production)
- [ ] Go to **Senders & IP** in Brevo dashboard
- [ ] Add sender email: `notifications@yourdomain.com`
- [ ] Click verification link in email from Brevo
- [ ] Add DNS records to your domain:
  - [ ] SPF record (TXT)
  - [ ] DKIM record (TXT)
  - [ ] DMARC record (TXT) - optional
- [ ] Wait for DNS propagation (up to 48 hours)
- [ ] Verify all records are active in Brevo

---

## Configure Local Environment (2 minutes)

- [ ] Open `.env` file in project root
- [ ] Update `BREVO_API_KEY` with your actual API key
- [ ] Update `BREVO_SENDER_EMAIL` with verified email
- [ ] Update `BREVO_SENDER_NAME` if desired (default: "TruPlace Team")
- [ ] Save the file
- [ ] Restart development server: `npm run dev`

---

## Configure Supabase Secrets (5 minutes)

Choose ONE method:

### Method A: Supabase Dashboard
- [ ] Go to [https://app.supabase.com](https://app.supabase.com)
- [ ] Select your project
- [ ] Navigate to **Edge Functions** → **send-email**
- [ ] Go to **Secrets** tab
- [ ] Add secret: `BREVO_API_KEY` = `xkeysib-your-key-here`
- [ ] Add secret: `BREVO_SENDER_EMAIL` = `notifications@yourdomain.com`
- [ ] Add secret: `BREVO_SENDER_NAME` = `TruPlace Team`
- [ ] Add secret: `APP_URL` = `http://localhost:5173` (or production URL)
- [ ] Save all secrets

### Method B: Supabase CLI
- [ ] Install CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref your-project-ref`
- [ ] Run these commands:
```bash
supabase secrets set BREVO_API_KEY=xkeysib-your-key-here
supabase secrets set BREVO_SENDER_EMAIL=notifications@yourdomain.com
supabase secrets set BREVO_SENDER_NAME="TruPlace Team"
supabase secrets set APP_URL=http://localhost:5173
```
- [ ] Verify: `supabase secrets list`

---

## Test Email Sending (10 minutes)

### Test 1: Via Application
- [ ] Start dev server: `npm run dev`
- [ ] Go to admin page: `/admin/company-requests`
- [ ] Find or create a test company request
- [ ] Approve the request
- [ ] Check recipient's email inbox
- [ ] Verify email arrived with correct formatting
- [ ] Click link in email to verify it works

### Test 2: Via Direct API Call
- [ ] Copy this command and update values:
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipientEmail": "your-test@example.com",
    "recipientName": "Test User",
    "emailType": "company_approved",
    "companyName": "Test Company",
    "notificationToken": "test-token-123"
  }'
```
- [ ] Run the command
- [ ] Check for success response: `{"success": true, "messageId": "..."}`
- [ ] Verify email arrived

### Test 3: Check Brevo Dashboard
- [ ] Go to Brevo dashboard
- [ ] Navigate to **Statistics** → **Email**
- [ ] Verify sent email appears in statistics
- [ ] Check delivery status is "Delivered"
- [ ] Check email is not in spam folder

---

## Verify Edge Function (5 minutes)

- [ ] Go to Supabase Dashboard → Edge Functions
- [ ] Confirm `send-email` function status is **ACTIVE**
- [ ] Click on function and check **Logs** tab
- [ ] Look for recent invocations
- [ ] Verify no error messages about missing environment variables
- [ ] Test both email types: `company_approved` and `company_rejected`

---

## Production Readiness (10 minutes)

### Update for Production
- [ ] Get production domain URL (e.g., `https://truplace.com`)
- [ ] Update Supabase secret: `APP_URL=https://yourdomain.com`
- [ ] Verify sender email uses custom domain (not Brevo default)
- [ ] Ensure DNS records are fully propagated
- [ ] Test email sending in production environment
- [ ] Update `.env` for production: `VITE_APP_URL=https://yourdomain.com`
- [ ] Set `VITE_DISABLE_AUTH_FOR_TESTING=false` (remove testing mode)

### Monitoring Setup
- [ ] Set up Brevo webhook for delivery events (optional)
- [ ] Add email failure alerts in application logs
- [ ] Monitor Brevo statistics dashboard regularly
- [ ] Check email delivery rates weekly

### Security
- [ ] API key stored securely (not in Git)
- [ ] Environment variables set in hosting platform
- [ ] Secrets verified in Supabase dashboard
- [ ] Different API keys for dev and production (optional)

---

## Troubleshooting

If emails aren't sending, check:

- [ ] BREVO_API_KEY is correct (starts with `xkeysib-`)
- [ ] Sender email is verified in Brevo
- [ ] Supabase secrets are set correctly
- [ ] Edge Function is ACTIVE and deployed
- [ ] No errors in Edge Function logs
- [ ] Brevo account hasn't exceeded daily limit (300 for free tier)
- [ ] APP_URL points to correct domain
- [ ] Recipient email is valid and not blacklisted

---

## Additional Resources

- [ ] Read **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)** for detailed instructions
- [ ] Read **[SUPABASE_SECRETS_SETUP.md](./SUPABASE_SECRETS_SETUP.md)** for secrets management
- [ ] Bookmark Brevo dashboard: https://app.brevo.com
- [ ] Bookmark Supabase dashboard: https://app.supabase.com
- [ ] Save Brevo support link: https://help.brevo.com

---

## Success Criteria

✅ All items above are checked
✅ Test emails arrive within 30 seconds
✅ Emails render correctly in Gmail, Outlook, and other clients
✅ Links in emails work and redirect to correct pages
✅ Both approval and rejection emails tested
✅ Brevo dashboard shows 100% delivery rate
✅ No errors in Supabase Edge Function logs
✅ Production environment variables configured

---

## Completion

Once all items are checked:

🎉 **Your email service is production-ready!**

Next steps:
1. Test thoroughly in staging environment
2. Deploy to production
3. Monitor Brevo dashboard for first week
4. Set up alerts for delivery failures
5. Consider upgrading Brevo plan when reaching 300 emails/day

---

## Quick Support

**Issue:** Emails not sending
**Fix:** Check EMAIL_SETUP_GUIDE.md → Troubleshooting section

**Issue:** Invalid API key
**Fix:** Regenerate key in Brevo → Update in Supabase secrets + .env

**Issue:** Emails going to spam
**Fix:** Verify SPF/DKIM/DMARC records → Use custom domain

**Need Help?**
- Brevo Support: https://help.brevo.com
- Supabase Docs: https://supabase.com/docs/guides/functions
- Check Edge Function logs for detailed errors
