# MySQL Database Import Guide

## Important
The application uses an external MySQL 8+ database. It does not create tables automatically at runtime. Import `database/office-by-overseas-skills.sql` once before deploying the application.

## 1. Create the database

The SQL file begins with:

```sql
CREATE DATABASE IF NOT EXISTS office_overseas
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE office_overseas;
```

You may either let the file create `office_overseas`, or create the database first in Hostinger hPanel with:

- Database name: `office_overseas` (or the provider-prefixed name)
- Character set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

If Hostinger automatically prefixes database names, use the final prefixed name in `MYSQL_DATABASE` while keeping the SQL `USE office_overseas` line aligned with the actual name before importing.

## 2. Import with Hostinger phpMyAdmin

1. Open hPanel → Databases → phpMyAdmin.
2. Select the dedicated database in the left sidebar.
3. Open the **Import** tab.
4. Choose `database/office-by-overseas-skills.sql`.
5. Use UTF-8 encoding and run the import.
6. Confirm that tables such as `users`, `franchises`, `orders`, `commissions`, `payouts`, and `settings` exist.

If the provider rejects `CREATE DATABASE` or `USE`, remove only those two statements and import while the target database is selected. Do not remove table definitions, foreign keys, indexes, or seed statements.

## 3. Import with MySQL CLI

```bash
mysql -h YOUR_HOST -P 3306 -u YOUR_USER -p < database/office-by-overseas-skills.sql
```

Enter the password when prompted. Do not put the password in shell history or commit it to a repository.

## 4. Configure the application

Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` in Vercel Environment Variables. `MYSQL_DATABASE` must be the actual database name shown by Hostinger, including any provider prefix.

## 5. First administrator

The schema intentionally does not create a plaintext administrator password. Create an Argon2id or bcrypt hash in the application/authentication setup and insert the first administrator using the `super_admin` role. Never insert a plaintext password.

## 6. Verification checklist

- Database uses `utf8mb4`.
- All tables imported without foreign-key errors.
- Seed roles and permissions are present.
- `settings` contains `site_name`, `timezone`, and commission defaults.
- The database user has privileges on the application database only.
- Vercel variables are configured for Preview and Production.
- No credentials are present in `.env.example`, SQL files, Git history, or browser code.

The SQL is idempotent for tables and seed rows, so it can be imported again for an existing installation. Take a backup before re-importing into a database that already contains production data.

## Hostinger deployment note

Vercel runs the Next.js application and connects to Hostinger MySQL over the network. Hostinger must allow remote MySQL connections from Vercel, or the database must expose a permitted hostname/firewall rule. If remote connections are not available on the hosting plan, keep the application and database on infrastructure that permits the connection; do not expose database credentials to the browser.

## Current schema scope

WordPress remains the source of truth for students, courses, and checkout. This database stores office users, franchises, snapshots of orders, commissions, wallet ledger entries, payouts, notifications, activity logs, webhook idempotency events, and system settings only.

## MiMSMS payload

The application sends server-side requests to `https://api.mimsms.com/api/V2/SMS` with JSON fields `apiKey`, `userName`, `senderName`, `transactionType: "T"`, `mobileNumber`, and `message`. Bangladesh mobile numbers are normalized to the `8801XXXXXXXXX` format. Credentials are never sent to the browser.

## Vercel and Hostinger split

- **Vercel**: Next.js application, API routes, environment variables, deployment, logs.
- **Hostinger**: MySQL database, SMTP mailbox, and optionally the WordPress/WooCommerce site.
- **GitHub**: Source control; never commit `.env`, `.env.local`, or real API credentials.
- **Later migration**: Download the repository, configure the same variables on Hostinger, import the SQL, and run the Next.js deployment using the host's supported Node.js process manager.

See `ENVIRONMENT_SETUP.md` for the complete variable-by-variable setup instructions.

> If any credentials previously appeared in a committed environment file, rotate them in MySQL, WordPress, WooCommerce, SMTP, and MiMSMS before production deployment. Removing a value from the latest file does not remove it from Git history.

## Troubleshooting

### `Access denied for user`
Check the exact provider-prefixed username and database name. Grant the user access to the selected database in hPanel.

### `Can't connect to MySQL server`
Confirm the hostname, port, remote access setting, and firewall allow Vercel connections.

### `Unknown database`
Set `MYSQL_DATABASE` to the name shown by Hostinger. If you imported into a prefixed database, update the `USE` line in the SQL file before importing.

### `Cannot add foreign key constraint`
Import into MySQL 8+ with InnoDB enabled. Ensure the SQL file is imported as one complete file rather than executing tables out of order.

### SMS returns an API error
Check the MiMSMS account balance, API key, username, and approved sender name. The request endpoint and JSON contract are fixed in `src/lib/integrations/messaging.ts`.

### SMTP connection fails
For Hostinger use `smtp.hostinger.com`; port `465` uses SSL and port `587` uses STARTTLS. Keep credentials server-side only.

## Security reminder

Rotate any real credentials that may have been shared in chat, source files, or Git history. Use Vercel's encrypted Environment Variables for production and preview values.
"}диғанлиқини бзи? nope invalid JSON due weird. Need retry clean. Use Write. 
