# Email Setup Guide for Contact Form

This guide will help you set up email functionality for your contact form using Resend.

## Resend Email Service Setup

Resend is a modern email API that provides reliable email delivery with excellent developer experience.

### Setup Steps:

1. **Create a Resend Account**
   - Go to [Resend](https://resend.com/)
   - Sign up for a free account
   - The free tier includes 3,000 emails per month

2. **Get Your API Key**
   - In your Resend dashboard, go to "API Keys"
   - Click "Create API Key"
   - Give it a name (e.g., "Portfolio Contact Form")
   - Copy the API key (it starts with `re_`)

3. **Set up Domain (Optional but Recommended)**
   - In Resend dashboard, go to "Domains"
   - Add your domain (e.g., `ayeshmantha.net`)
   - Follow the DNS setup instructions
   - This allows you to send emails from `noreply@ayeshmantha.net`

4. **Configure Cloudflare Worker**
   - Go to your Cloudflare Worker dashboard
   - Navigate to Settings > Environment Variables
   - Add a new secret variable:
     - Name: `RESEND_API_KEY`
     - Value: Your Resend API key (e.g., `re_123456789...`)

5. **Deploy Your Worker**
   - Save the environment variable
   - Your worker will automatically use Resend for sending emails

## Testing Your Setup

1. **Development Testing**
   - Your contact form should now work
   - Fill out the form on your website
   - Check your email inbox for contact form submissions

2. **Production Testing**
   - Test the form on your live website
   - Verify emails are being delivered properly
   - Check Resend dashboard for delivery stats

## Email Configuration

The system is configured to:
- Send emails **from**: `noreply@ayeshmantha.net` (or your domain)
- Send emails **to**: `info@ayeshmantha.net`
- Include **reply-to**: The sender's email address
- Include all form data in a formatted HTML email

## Troubleshooting

### Common Issues:

1. **Emails Not Sending**
   - Check that `RESEND_API_KEY` is set correctly in Cloudflare
   - Verify the API key is valid in Resend dashboard
   - Check Cloudflare Worker logs for errors

2. **Emails Going to Spam**
   - Set up your domain in Resend for better deliverability
   - Configure SPF, DKIM, and DMARC records
   - Use a verified sending domain

3. **Rate Limiting**
   - Resend free tier: 3,000 emails/month
   - Paid plans available for higher volumes
   - Check your usage in Resend dashboard

### Getting Help:

1. Check the browser console for error messages
2. Review Cloudflare Worker logs
3. Check Resend dashboard for delivery status
4. Contact Resend support if needed

## Fallback Options

If Resend fails for any reason, the system will:
1. Show an error message to the user
2. Fall back to opening the user's email client with a pre-filled message
3. Ensure the user can still contact you

## Security Considerations

1. **API Key Security**
   - Never expose your Resend API key in client-side code
   - Store it securely in Cloudflare Worker environment variables
   - Rotate your API key periodically

2. **Input Validation**
   - All form inputs are validated before sending
   - Email addresses are validated using regex
   - Required fields are checked

3. **Rate Limiting**
   - Consider implementing rate limiting for production use
   - Monitor usage in Resend dashboard

## Current Implementation

Your contact form is now set up with:
- **Primary**: Resend via Cloudflare Worker
- **Fallback**: Mailto link (opens user's email client)

The system will try Resend first, and if it fails, will fall back to the mailto option to ensure users can always contact you.
