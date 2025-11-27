# Supabase Edge Function Secrets Setup

## Quick Setup Guide

The `send-email` Edge Function requires environment variables to be set as **secrets** in your Supabase project.

---

## Method 1: Using Supabase Dashboard (Recommended)

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project: `imlajpgvwpuoiqogzmjx`

2. **Navigate to Edge Functions**
   - Click **Edge Functions** in the left sidebar
   - Find and click on the `send-email` function

3. **Set Secrets**
   - Look for **Secrets** or **Settings** tab
   - Add the following secrets one by one:

   ```
   Secret Name: BREVO_API_KEY
   Secret Value: xkeysib-your-actual-brevo-api-key-here

   Secret Name: BREVO_SENDER_EMAIL
   Secret Value: notifications@truplace.com

   Secret Name: BREVO_SENDER_NAME
   Secret Value: TruPlace Team

   Secret Name: APP_URL
   Secret Value: http://localhost:5173
   ```

4. **Save Changes**
   - Click Save/Update for each secret
   - The Edge Function will automatically restart with new secrets

---

## Method 2: Using Supabase CLI

### Prerequisites:
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref imlajpgvwpuoiqogzmjx
```

### Set Secrets:
```bash
# Set all secrets at once
supabase secrets set BREVO_API_KEY=xkeysib-your-actual-brevo-api-key-here
supabase secrets set BREVO_SENDER_EMAIL=notifications@truplace.com
supabase secrets set BREVO_SENDER_NAME="TruPlace Team"
supabase secrets set APP_URL=http://localhost:5173
```

### Verify Secrets:
```bash
# List all secrets (values will be hidden)
supabase secrets list
```

### Expected Output:
```
NAME                  VALUE
BREVO_API_KEY         xk************************************
BREVO_SENDER_EMAIL    no***************************.com
BREVO_SENDER_NAME     Tr***************
APP_URL               ht*************************73
```

---

## For Production Deployment

When deploying to production, update the secrets:

```bash
# Update APP_URL to production domain
supabase secrets set APP_URL=https://yourdomain.com

# All other secrets remain the same (unless using different API key)
```

**Or in Dashboard:**
- Navigate to Edge Functions > send-email > Secrets
- Update `APP_URL` to `https://yourdomain.com`

---

## Verify Secrets Are Working

### Test the Edge Function:

```bash
curl -X POST \
  'https://imlajpgvwpuoiqogzmjx.supabase.co/functions/v1/send-email' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "recipientEmail": "your-test-email@example.com",
    "recipientName": "Test User",
    "emailType": "company_approved",
    "companyName": "Test Company Inc.",
    "notificationToken": "test-token-123"
  }'
```

### Check Edge Function Logs:

**Via Dashboard:**
1. Go to Edge Functions > send-email
2. Click **Logs** tab
3. Look for any errors related to missing environment variables

**Via CLI:**
```bash
supabase functions logs send-email --tail
```

### Look for Success Indicators:
- ✅ No "Missing required environment variables" errors
- ✅ Email appears in Brevo dashboard statistics
- ✅ Test email arrives in recipient's inbox

---

## Troubleshooting

### Error: "Missing required environment variables"

**Cause:** Secrets not set or not accessible by the Edge Function

**Solution:**
1. Verify secrets are set: `supabase secrets list`
2. Re-set the secrets using the commands above
3. Restart the Edge Function (automatic when saving secrets)
4. Wait 1-2 minutes for secrets to propagate

### Error: "Invalid API key"

**Cause:** Wrong Brevo API key or typo

**Solution:**
1. Generate a new API key from Brevo dashboard
2. Update the secret: `supabase secrets set BREVO_API_KEY=new-key`
3. Test again

### Secrets Not Updating

**Solution:**
1. Try using the Supabase Dashboard instead of CLI
2. Clear browser cache and refresh
3. Wait a few minutes for changes to propagate
4. Check Edge Function logs for confirmation

---

## Security Best Practices

1. **Never commit secrets to Git**
   - Secrets should only exist in Supabase and your local `.env`
   - The `.env` file is in `.gitignore`

2. **Use different keys for development and production**
   - Development: Lower security, testing mode
   - Production: Strict security, monitoring enabled

3. **Rotate secrets regularly**
   - Change API keys every 6-12 months
   - Update in both Supabase secrets and `.env` file

4. **Monitor secret usage**
   - Check Edge Function logs regularly
   - Set up alerts for authentication failures

---

## Quick Reference

| Secret Name | Example Value | Required |
|-------------|--------------|----------|
| `BREVO_API_KEY` | `xkeysib-abc123...` | ✅ Yes |
| `BREVO_SENDER_EMAIL` | `notifications@truplace.com` | ✅ Yes |
| `BREVO_SENDER_NAME` | `TruPlace Team` | ✅ Yes |
| `APP_URL` | `http://localhost:5173` | ✅ Yes |

---

## Next Steps

After setting up secrets:

1. ✅ Test email sending locally
2. ✅ Verify emails arrive and render correctly
3. ✅ Check Brevo dashboard for delivery metrics
4. ✅ Update secrets with production values when deploying
5. ✅ Set up monitoring and alerts

---

## Support Resources

- **Supabase Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Supabase CLI Docs**: https://supabase.com/docs/reference/cli
- **Environment Variables**: https://supabase.com/docs/guides/functions/secrets

**Need Help?** Check the main EMAIL_SETUP_GUIDE.md for detailed instructions.
