# Deployment Guide (Comprehensive)

End‑to‑end steps to deploy Partner App to Vercel with Postgres, cron jobs, push notifications, and PWA assets.

## 1. Prerequisites
- Git & GitHub account
- Node.js 18+
- OpenSSL & `npx` available
- Vercel account

## 2. Local Repo Initialization
```bash
git init
git add .
git commit -m "Initial commit: Partner App"
git branch -M main
git remote add origin https://github.com/<user>/space.git
git push -u origin main
```

## 3. Generate Secrets
```bash
npx web-push generate-vapid-keys      # VAPID keys
openssl rand -base64 32               # SESSION_SECRET
openssl rand -hex 32                  # CRON_SECRET
openssl rand -hex 32                  # CRON_TEST_SECRET
```
Record: public/private VAPID, session secret, both cron secrets.

## 4. Create Vercel Project
1. https://vercel.com → Add New Project
2. Import GitHub repo
3. Framework: Next.js (autodetected)
4. Root: `./` | Build: `npm run build` | Output: `.next`

## 5. Provision Vercel Postgres
1. Project dashboard → Storage → Postgres → Create
2. Choose region near users
3. Vercel injects Postgres env vars; copy one for `DATABASE_URL` if needed

## 6. Environment Variables (Production & Preview)
```
DATABASE_URL=<postgres or POSTGRES_PRISMA_URL>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public vapid>
VAPID_PRIVATE_KEY=<private vapid>
SESSION_SECRET=<base64>
CRON_SECRET=<hex>
CRON_TEST_SECRET=<hex>
NEXT_PUBLIC_APP_URL=https://<your-app>.vercel.app
```
Optional: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`.

## 7. First Deployment
Push `main` → Vercel builds & deploys. Confirm live URL.

## 8. Run Migrations
**First time setup** (create initial migration):
```powershell
# Pull production environment variables
vercel env pull .env.production

# Set DATABASE_URL from .env.production and create migration
$env:DATABASE_URL=(Get-Content .env.production | Select-String "^DATABASE_URL" | ForEach-Object { $_ -replace '^DATABASE_URL=', '' } | ForEach-Object { $_.Trim('"') })
npx prisma migrate dev --name init
```

**Subsequent migrations** (after schema changes):
```powershell
# Create and apply new migration
$env:DATABASE_URL=(Get-Content .env.production | Select-String "^DATABASE_URL" | ForEach-Object { $_ -replace '^DATABASE_URL=', '' } | ForEach-Object { $_.Trim('"') })
npx prisma migrate dev --name describe_your_change
```

**Deploy only** (if migrations already exist):
```powershell
$env:DATABASE_URL=(Get-Content .env.production | Select-String "^DATABASE_URL" | ForEach-Object { $_ -replace '^DATABASE_URL=', '' } | ForEach-Object { $_.Trim('"') })
npx prisma migrate deploy
```

**Note**: The build script automatically runs `prisma generate` to ensure the Prisma client is up to date. The `postinstall` script also runs `prisma generate` after dependencies are installed.

## 9. PWA Icons
Replace placeholders:
```
public/icon-192.png  # 192x192 pastel
public/icon-512.png  # 512x512 pastel
```
Remove `.txt` versions → commit → redeploy.

## 10. Functional Verification
Use two browsers/incognito:
1. Register user A
2. Create space & invite
3. User B registers via invite
4. Notice: post → view (user B) → mark seen → edit test
5. Sutta: first click normal, second SOS
6. Mood submission & partner notification
7. Gossip send/re-read last message
8. Frustration buttons once each
9. Notification badge increments & clears

## 11. Push Notification Test
1. Subscribe & allow permission
2. Trigger Sutta click → push appears
3. If not, verify `/sw.js` accessible & re-subscribe
4. Queue fallback shows notification

## 12. Cron Endpoints
Test:
```bash
curl -H "Authorization: Bearer $CRON_TEST_SECRET" \
  https://<your-app>.vercel.app/api/cron/mood-prompt-test
```
Expect JSON with `success:true`.

## 13. Cron Schedule
Dashboard → Settings → Cron Jobs: verify entries. After scheduled time, mood notifications should queue.

## 14. Logging & Monitoring
- Vercel deployment logs (functions)
- Add Sentry for error tracking (optional)

## 15. Common Issues
| Issue | Cause | Fix |
|-------|-------|-----|
| 500 DB | Migrations missing | Run `npx prisma migrate deploy` |
| Auth lost | Bad/missing secret | Regenerate `SESSION_SECRET` |
| No push | Permission/SW issue | Re-subscribe; check `/sw.js` |
| Cron inert | Wrong Bearer token | Verify header & secret |
| Notice lock | Partner not viewed | Have partner open & mark seen |

## 16. Maintenance
- Weekly: Logs, notification queue size
- Monthly: Purge read notifications >30d
- Quarterly: Dependency + Prisma updates

## 17. Scaling
- Introduce WebSockets for real-time updates
- Redis for counters/rate limiting
- Add API rate limiting middleware

## 18. Rollback
Vercel dashboard: promote previous deployment. Or:
```bash
git revert <sha>
git push origin main
```

## 19. Security
- Secrets only in Vercel env vars
- Use ≥32 byte random values
- Review dependency advisories quarterly

## 20. Smoke Test Script
```bash
BASE=https://<your-app>.vercel.app
curl -s $BASE/api/auth/me | grep -q 'user' && echo OK: auth || echo Needs session
curl -s -o /dev/null -w '%{http_code}' $BASE/api/spaces | grep -q '401' && echo OK: protected || echo Warn: unprotected
```

## 21. Post-Launch
- Collect feedback
- Prioritize roadmap (dark mode, accessibility)
- Add analytics & error tracking

---
Consolidated deployment guide created; supersedes earlier documents.
