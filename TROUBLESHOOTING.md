# Troubleshooting Guide

This document helps diagnose and fix common issues with the Space application.

## Spaces Not Appearing (Database Schema Mismatch)

### Symptoms
- Spaces that previously existed are no longer visible in the dashboard
- The dashboard shows an empty list of spaces
- You may see an error message: "Database schema mismatch. Please run database migrations"
- Console logs show database errors about missing columns

### Cause
This usually happens when:
1. Code with schema changes was deployed (e.g., adding the `suttaEnabled` field)
2. The Prisma client was regenerated with the new schema
3. But the database migration was not run in production

The Prisma client expects columns that don't exist in the database yet.

### Solution

#### For Vercel Deployment

1. **Pull your production environment variables**
   ```bash
   vercel env pull .env.production
   ```

2. **Set the DATABASE_URL environment variable** (PowerShell)
   ```powershell
   $env:DATABASE_URL=(Get-Content .env.production | Select-String "^DATABASE_URL" | ForEach-Object { $_ -replace '^DATABASE_URL=', '' } | ForEach-Object { $_.Trim('"') })
   ```

   Or (bash/zsh)
   ```bash
   export DATABASE_URL=$(grep ^DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"')
   ```

3. **Run the pending migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Verify the migration was successful**
   ```bash
   npx prisma db pull
   ```
   
   This will show you the current state of your database schema.

5. **Refresh your application** - spaces should now appear again

#### For Other Deployment Platforms

1. Connect to your production database using the DATABASE_URL
2. Run `npx prisma migrate deploy` with the DATABASE_URL environment variable set
3. The command will apply all pending migrations

### Verification

After running migrations, verify that:
- The `Space` table has a `suttaEnabled` column
- Spaces appear in your dashboard
- No error messages appear in the console

### Prevention

Always run migrations as part of your deployment process:

1. **Update your deployment script** to include:
   ```bash
   npx prisma migrate deploy
   ```

2. **For Vercel**, you can add a build command that includes migrations:
   ```json
   {
     "scripts": {
       "build": "prisma generate && prisma migrate deploy && next build"
     }
   }
   ```
   
   **Note**: Be cautious with running migrations during build, as this requires DATABASE_URL at build time and may cause deployment issues if migrations fail.

3. **Alternative**: Run migrations manually after each deployment that includes schema changes.

## Other Common Issues

### Authentication Issues

**Symptom**: Logged out unexpectedly or can't log in

**Solution**: 
- Check that SESSION_SECRET is properly set in environment variables
- SESSION_SECRET must be the same value across all deployments
- Regenerate SESSION_SECRET if compromised: `openssl rand -base64 32`

### Push Notifications Not Working

**Symptom**: Not receiving push notifications

**Solution**:
1. Verify browser permissions are granted
2. Check that VAPID keys are correctly set in environment variables
3. Ensure service worker (`/sw.js`) is accessible
4. Try unsubscribing and resubscribing to push notifications

### Cron Jobs Not Triggering

**Symptom**: Scheduled mood prompts not appearing

**Solution**:
1. Verify CRON_SECRET is set correctly in Vercel
2. Check that cron jobs are configured in `vercel.json`
3. Test manually: `curl -H "Authorization: Bearer $CRON_TEST_SECRET" https://your-app.vercel.app/api/cron/mood-prompt-test`

## Getting Help

If you're still experiencing issues:
1. Check the browser console for errors
2. Check Vercel function logs for server-side errors
3. Review the deployment guide in `DEPLOYMENT.md`
4. Open an issue on GitHub with:
   - Description of the problem
   - Steps to reproduce
   - Error messages from console/logs
   - Environment (browser, OS, deployment platform)
