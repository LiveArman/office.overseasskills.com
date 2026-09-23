# Environment Variables Setup Guide

## Overview
This document explains every environment variable required for Office By Overseas Skills, how to generate each one, and what service it configures.

---

## Database Configuration
### MYSQL_HOST
- **Purpose**: MySQL server hostname/IP address
- **Service**: MySQL 8+ (external, on Hostinger or similar)
- **Example**: `194.59.164.63` or `db.example.com`
- **How to generate**: Contact your hosting provider or database administrator
- **Required for**: All database operations

### MYSQL_PORT
- **Purpose**: MySQL server port
- **Service**: MySQL 8+
- **Default**: `3306`
- **How to generate**: Usually provided by hosting provider; defaults to 3306
- **Required for**: Database connection

### MYSQL_DATABASE
- **Purpose**: MySQL database name
- **Service**: MySQL 8+
- **Example**: `office_overseas`
- **How to generate**: Create this database and import `database/office-by-overseas-skills.sql`
- **Required for**: All database operations

### MYSQL_USER
- **Purpose**: MySQL database username
- **Service**: MySQL 8+
- **How to generate**: Create this user in your MySQL hosting control panel with full privileges on `MYSQL_DATABASE`
- **Required for**: Database authentication

### MYSQL_PASSWORD
- **Purpose**: MySQL database password
- **Service**: MySQL 8+
- **How to generate**: Generate a strong password in your hosting control panel or use `openssl rand -base64 32`
- **Security**: Never commit to git; add only in `.env` locally and Vercel environment variables
- **Required for**: Database authentication

---

## Authentication & Session
### AUTH_SECRET
- **Purpose**: Server-side session encryption key
- **Service**: Session management
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Example Output**: `abc123XYZ+/==`
- **Security**: Critical—regenerate if leaked; never share or commit to git
- **Required for**: Secure session tokens and cookies

---

## WordPress Integration
### WORDPRESS_URL
- **Purpose**: Root URL of your WordPress site
- **Service**: WordPress (external, on overseasskills.com)
- **Example**: `https://overseasskills.com`
- **How to generate**: Your WordPress site URL
- **Required for**: Student lookup, course reading, order creation

### WORDPRESS_USERNAME
- **Purpose**: WordPress user account for API access
- **Service**: WordPress
- **How to generate**: Create a dedicated WordPress user (e.g., `office_api_user`) with Editor role
- **Required for**: WordPress API authentication

### WORDPRESS_APP_PASSWORD
- **Purpose**: Application-specific password for WordPress REST API
- **Service**: WordPress (WP REST API)
- **How to generate**:
  1. Log in to WordPress as admin
  2. Go to Users → Your Profile
  3. Scroll to "Application Passwords"
  4. Enter app name: `Office by Overseas Skills`
  5. Click "Add New Application Password"
  6. Copy the generated password (won't be shown again)
- **Format**: 24 alphanumeric characters with spaces
- **Security**: Never share or commit to git
- **Required for**: WordPress REST API requests

---

## WooCommerce Integration
### WOOCOMMERCE_CONSUMER_KEY
- **Purpose**: OAuth consumer key for WooCommerce REST API
- **Service**: WooCommerce
- **How to generate**:
  1. In WordPress admin, go to WooCommerce → Settings → Advanced → REST API
  2. Click "Add key" (or "Create an API key")
  3. Description: `Office by Overseas Skills`
  4. User: Select the API user (or WordPress user created above)
  5. Permissions: Select "Read/Write" for Orders and Products
  6. Click "Generate API credentials"
  7. Copy the Consumer Key
- **Format**: Alphanumeric with underscore/dash, ~40 characters
- **Security**: Never share; regenerate if exposed
- **Required for**: WooCommerce order reading and status updates

### WOOCOMMERCE_CONSUMER_SECRET
- **Purpose**: OAuth consumer secret for WooCommerce REST API
- **Service**: WooCommerce
- **How to generate**: Generated alongside `WOOCOMMERCE_CONSUMER_KEY` (see above); copy the Consumer Secret
- **Format**: Alphanumeric, ~40 characters
- **Security**: Never share; regenerate if exposed
- **Required for**: WooCommerce API authentication

---

## Webhooks & Security
### WEBHOOK_HMAC_SECRET
- **Purpose**: Secret key to verify webhook signatures from WooCommerce
- **Service**: Webhook verification
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Example Output**: `xyz789abc+/==`
- **Usage**: Prevents unauthorized webhook calls; every WooCommerce webhook includes an HMAC signature that must match
- **Security**: Critical; regenerate if leaked
- **Required for**: Secure webhook processing

---

## MiMSMS SMS Gateway
### MIMSMS_API_KEY
- **Purpose**: API authentication key for MiMSMS SMS service
- **Service**: MiMSMS (https://api.mimsms.com)
- **How to generate**:
  1. Log in to MiMSMS dashboard at https://www.mimsms.com
  2. Navigate to API Settings or Integration
  3. Copy or generate your API Key
- **Format**: Alphanumeric, typically 32–64 characters
- **Security**: Never share or commit to git
- **Required for**: Sending SMS notifications

### MIMSMS_USERNAME
- **Purpose**: MiMSMS account username/email for API requests
- **Service**: MiMSMS
- **Example**: `info@overseasskills.com` or your MiMSMS login email
- **How to generate**: Use the email associated with your MiMSMS account
- **Required for**: SMS authentication

### MIMSMS_SENDER_NAME
- **Purpose**: Approved sender ID/name that appears on SMS messages
- **Service**: MiMSMS
- **Example**: `OVERSEAS SKILLS` or `OSS CENTER`
- **How to generate**:
  1. Log in to MiMSMS dashboard
  2. Navigate to Sender IDs or Branding
  3. Add a new sender ID (must be approved by MiMSMS; usually takes 1–2 hours)
  4. Use the approved sender name
- **Constraints**: Maximum 11 alphanumeric characters (some providers allow up to 15); no special characters except spaces
- **Required for**: SMS delivery with custom branding

---

## SMTP Email Service
### SMTP_HOST
- **Purpose**: SMTP server hostname for sending emails
- **Service**: Email provider (Hostinger in this case)
- **Example**: `smtp.hostinger.com`
- **How to generate**: Provided by your email hosting provider
- **Common values**:
  - Hostinger: `smtp.hostinger.com`
  - Gmail: `smtp.gmail.com`
  - Office 365: `smtp.office365.com`
- **Required for**: Email delivery

### SMTP_PORT
- **Purpose**: SMTP server port
- **Service**: Email provider
- **Examples**:
  - 587 (TLS, recommended for most providers)
  - 465 (SSL/TLS, often used for secure connections)
  - 25 (unencrypted, rarely used for modern setups)
- **For Hostinger**: Use `465` with `secure: true`
- **How to generate**: Check your email provider's documentation; usually 587 or 465
- **Required for**: SMTP connection

### SMTP_USER
- **Purpose**: SMTP username (usually your full email address)
- **Service**: Email provider
- **Example**: `info@overseasskills.com`
- **How to generate**: Your email account username/address
- **Required for**: SMTP authentication

### SMTP_PASSWORD
- **Purpose**: SMTP password or app-specific password
- **Service**: Email provider
- **How to generate**:
  - If your email provider supports app passwords (Google, Microsoft), create one
  - Otherwise, use your email account password
  - For Gmail: Generate an App Password in Security settings
  - For Hostinger: Use your mailbox password
- **Security**: Never commit to git; add only in `.env` and Vercel secrets
- **Required for**: SMTP authentication

### SMTP_FROM
- **Purpose**: Email address that appears in the "From" field of sent emails
- **Service**: Email provider
- **Example**: `info@overseasskills.com` or `noreply@overseasskills.com`
- **How to generate**: Usually your main email or a no-reply address
- **Constraints**: Must be from the same domain as your email account (to avoid being marked as spam)
- **Required for**: Email sending

---

## Cron Jobs & Secrets
### CRON_SECRET
- **Purpose**: Secret token to protect cron job endpoints from unauthorized access
- **Service**: Cron job verification
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Example Output**: `def456XYZ+/==`
- **Usage**: Only requests with the correct `CRON_SECRET` header can trigger cron endpoints (e.g., monthly payout generation)
- **Security**: Critical; regenerate if leaked
- **Where to use**: Include in cron job configuration
- **Example Hostinger cron command**:
  ```
  curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://office.overseasskills.com/api/cron/generate-payouts
  ```
- **Required for**: Secure cron operations

---

## Application & Timezone
### APP_URL
- **Purpose**: Public URL of the application
- **Service**: General app configuration
- **Example**: `https://office.overseasskills.com`
- **How to generate**: Your application's production domain
- **Used for**: Generating password reset links, email confirmations, redirects
- **Required for**: Email templates and OAuth redirects

### APP_TIMEZONE
- **Purpose**: Server-side timezone for all timestamps and cron schedules
- **Service**: General app configuration
- **Example**: `Asia/Dhaka`
- **Values**: Standard IANA timezone strings (e.g., `America/New_York`, `Europe/London`)
- **How to generate**: Use the timezone where your business operates
- **Used for**: Recording transaction timestamps, scheduling payouts at 00:15 on the 1st of each month
- **Required for**: Correct timestamp handling

---

## Summary: What to Set Where

| Variable | Set in `.env` | Set in Vercel | Priority |
|---|---|---|---|
| MYSQL_* | Yes | Yes | Critical—no database connection without these |
| AUTH_SECRET | Yes | Yes | Critical—sessions won't work without this |
| WORDPRESS_* | Yes | Yes | Critical—can't sync students/courses without this |
| WOOCOMMERCE_* | Yes | Yes | Critical—can't read orders without this |
| WEBHOOK_HMAC_SECRET | Yes | Yes | Critical—webhooks won't verify without this |
| MIMSMS_* | Yes | Yes | Critical—SMS won't send without these |
| SMTP_* | Yes | Yes | Critical—email won't send without these |
| CRON_SECRET | Yes | Yes | Critical—cron jobs won't run without this |
| APP_URL | Yes | Yes | Required—for links in emails and OAuth |
| APP_TIMEZONE | Yes | Yes | Recommended—defaults to UTC if omitted |

---

## Steps to Deploy to Vercel

1. **Create `.env.local` locally** with all values from `.env.example`
2. **Test locally**: `npm run dev` and verify no environment errors
3. **Push to GitHub** (do not commit `.env.local`)
4. **In Vercel Dashboard**:
   - Go to Settings → Environment Variables
   - Add each variable from the table above (exclude `.env`-only test keys)
5. **Redeploy** to apply environment variables
6. **Verify logs** in Vercel dashboard for any configuration errors

---

## Troubleshooting

### Database Connection Fails
- Check `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- Verify the database user has privileges: `GRANT ALL ON office_overseas.* TO 'user'@'%';`
- Test locally first with `npm run dev`

### SMS Not Sending
- Verify `MIMSMS_API_KEY`, `MIMSMS_USERNAME`, `MIMSMS_SENDER_NAME` are correct
- Check MiMSMS dashboard for account balance and sender ID approval status
- Review logs for provider error messages

### Emails Not Sending
- Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- For Hostinger: Port must be 465 (SSL)
- For Gmail: Use an App Password, not your account password
- Check your email provider's security settings

### Webhooks Failing
- Verify `WEBHOOK_HMAC_SECRET` matches the secret set in WooCommerce webhook configuration
- Check WooCommerce webhook logs for failed deliveries
- Ensure `APP_URL` is publicly accessible

---

## Security Best Practices

1. **Never commit secrets to git** — `.env` and `.env.local` are in `.gitignore`
2. **Rotate secrets regularly** — Regenerate `AUTH_SECRET`, `WEBHOOK_HMAC_SECRET`, `CRON_SECRET` annually
3. **Use strong passwords** — For `MYSQL_PASSWORD`, `SMTP_PASSWORD`, use `openssl rand -base64 32`
4. **Limit API key scopes** — Give WooCommerce keys only the permissions they need
5. **Monitor logs** — Review Vercel and application logs for suspicious activity
6. **Backup secrets** — Store a copy of all secrets in a secure vault (1Password, Bitwarden, etc.)
