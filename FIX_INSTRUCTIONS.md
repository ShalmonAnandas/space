# How to Fix: Spaces Disappeared After Commit 51b5eb5

## What Happened

After the commit that added the `suttaEnabled` field to the Space model (commit 51b5eb5), your spaces stopped appearing in the dashboard. **Don't worry - your spaces are still in the database!** The issue is that the database migration wasn't applied.

## Why This Happened

The commit added a new column `suttaEnabled` to the Space table in the database schema. When code was deployed:

1. ✅ The new Prisma schema was updated
2. ✅ The Prisma client was regenerated 
3. ❌ **The database migration was NOT run**

So now:
- The Prisma client expects a `suttaEnabled` column
- But your production database doesn't have this column yet
- When the app tries to fetch spaces, it fails
- The dashboard shows no spaces

## The Solution

You need to run the pending database migration. Follow these steps:

### Step 1: Pull Your Production Environment Variables

```bash
vercel env pull .env.production
```

This downloads your production environment variables (including DATABASE_URL) to a file called `.env.production`.

### Step 2: Set the DATABASE_URL

Choose the command for your shell:

**PowerShell (Windows):**
```powershell
$env:DATABASE_URL=(Get-Content .env.production | Select-String "^DATABASE_URL" | ForEach-Object { $_ -replace '^DATABASE_URL=', '' } | ForEach-Object { $_.Trim('"') })
```

**Bash/Zsh (Mac/Linux):**
```bash
export DATABASE_URL=$(grep ^DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"')
```

### Step 3: Run the Migration

```bash
npx prisma migrate deploy
```

You should see output like:
```
1 migration found in prisma/migrations
Applying migration `20251119113504_add_sutta_enabled_to_space`

Database now in sync with Prisma schema.
```

### Step 4: Verify the Fix

1. Go to your Space application: https://your-app.vercel.app/dashboard
2. Your spaces should now appear!
3. If you still see an error, check the browser console for details

## What We've Fixed in This PR

To prevent confusion in the future and help diagnose issues faster, this PR includes:

1. **Better Error Messages**: When the spaces API fails due to a schema mismatch, it now shows:
   ```
   Database schema mismatch. Please run database migrations: npx prisma migrate deploy
   ```

2. **Improved Dashboard**: Error messages from the API are now displayed in toast notifications, so you can see what went wrong.

3. **Comprehensive Documentation**: 
   - Added `TROUBLESHOOTING.md` with detailed solutions
   - Updated `DEPLOYMENT.md` with warnings about migrations
   - Updated `README.md` with troubleshooting links

## Future Prevention

To prevent this from happening again, **always run migrations after deploying code with schema changes**:

```bash
# After each deployment with Prisma schema changes:
vercel env pull .env.production
export DATABASE_URL=$(grep ^DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"')
npx prisma migrate deploy
```

You can also add this to your deployment checklist or CI/CD pipeline.

## Still Having Issues?

If you're still seeing problems after following these steps:

1. Check the browser console for errors
2. Check your Vercel function logs for server errors
3. Refer to `TROUBLESHOOTING.md` for more detailed guidance
4. Open a GitHub issue with error details if needed

## Questions?

Feel free to ask in the PR comments if you need help with any of these steps!
