# Space

Private, two-person “shared space” for asynchronous micro‑communication: notices, moods, sutta (ping) button, ephemeral gossip, frustration vents, and dual‑track notifications (web push + in‑app queue fallback) with PWA support.

## 1. Features Overview
- Authentication: username/password, 30‑day cookie session (iron-session)
- Shared Spaces: create, invite via one‑time link, two‑partner limit
- Notice Board: one message at a time, seen status, 3h cooldown, single edit window
- Sutta Button: daily click counter, SOS mode after multiple clicks
- Mood Sharing: predefined moods, cron prompts 3× daily
- Gossip: ephemeral read-once messages + re-read last message
- Frustration Buttons: three vent buttons (daily limits)
- Notifications: web push (VAPID) + fallback queue; unread badge
- PWA: installable, offline caching, service worker, manifest
- Cron Jobs: scheduled mood prompt (production + test endpoints)

## 2. Tech Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (retro pastel theme) |
| DB | Postgres (Vercel Postgres) + Prisma ORM |
| Auth | iron-session + bcrypt |
| State | Zustand (client) |
| Push | web-push (VAPID) |
| PWA | Manifest + Service Worker |
| Deployment | Vercel (Cron + Postgres) |

## 3. Directory Structure (Key Paths)
```
space/
  app/                # Pages + API routes
    api/              # 23 endpoints (auth, spaces, invites, push, notifications, cron, features)
  components/         # UI feature components
  lib/                # Auth/session, prisma client, notification & push helpers, hooks, store
  prisma/             # schema.prisma
  public/             # manifest.json, service worker, icons
  .env.example        # Environment template
  README.md           # This file
```

## 4. Environment Variables
Create `.env.local` (or `.env`) from `.env.example`.
Primary:
```
DATABASE_URL="postgres connection string"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="<generated public VAPID>"
VAPID_PRIVATE_KEY="<generated private VAPID>"
CRON_SECRET="<hex for production cron>"
CRON_TEST_SECRET="<hex for test cron>"
SESSION_SECRET="<32+ byte random base64>"
```
Optional (Vercel Postgres variants):
```
POSTGRES_URL="(pooling)"
POSTGRES_PRISMA_URL="(direct for Prisma)"
POSTGRES_URL_NON_POOLING="(non‑pooling)"
```
Set `DATABASE_URL` to whichever Postgres URL suits Prisma (direct or pooled).

## 5. Installation & Local Setup
Prerequisites: Node.js 18+, Postgres (local or cloud), Git.
```bash
git clone <repo-url>
cd space
cp .env.example .env.local
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Visit: http://localhost:3000

## 6. Generating Secrets
```bash
npx web-push generate-vapid-keys        # VAPID keys
openssl rand -base64 32                 # SESSION_SECRET
openssl rand -hex 32                    # CRON_SECRET
openssl rand -hex 32                    # CRON_TEST_SECRET
```

## 7. Development Commands
```bash
npm run dev
npm run build
npm run start
npm run lint
npx prisma migrate dev --name <msg>
npx prisma studio
```

## 8. API Endpoints (Summary)
Authentication:
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me
- POST /api/auth/logout
Spaces & Invites:
- GET /api/spaces
- POST /api/spaces
- DELETE /api/spaces/[id]
- POST /api/spaces/[id]/invite
- GET /api/invites/[inviteId]
- POST /api/invites/[inviteId]/join
Features:
- GET/POST/PUT /api/spaces/[id]/notice
- POST /api/spaces/[id]/notice/seen
- POST /api/spaces/[id]/daily-click
- POST /api/spaces/[id]/mood
- GET/POST /api/spaces/[id]/gossip
- GET /api/spaces/[id]/gossip/reread
Notifications & Push:
- POST /api/push/subscribe
- POST /api/push/unsubscribe
- GET /api/notifications
- POST /api/notifications/[id]/read
Cron:
- GET /api/cron/mood-prompt        (Bearer CRON_SECRET)
- GET /api/cron/mood-prompt-test   (Bearer CRON_TEST_SECRET)

## 9. Business Rules
- Notice: Locked until partner sees; 3h cooldown from original post time; single edit allowed within 3h.
- Sutta: First click normal; ≥2 clicks triggers SOS for day.
- Frustration: Each button once per 24h.
- Gossip: Read-once messages; last partner message re-readable.
- Mood: Prompted by cron 3× daily.
- Notifications: Always persisted; push attempted if subscription exists.

## 10. PWA & Service Worker
- Add real PNG icons: `public/icon-192.png`, `public/icon-512.png`.
- `manifest.json` config matches pastel theme.
- `sw.js` handles caching & push events.
- Install prompt via `InstallPrompt` component.

## 11. Deployment (Overview)
1. Push repo to GitHub.
2. Create Vercel project (Next.js autodetected).
3. Add Vercel Postgres (injects connection vars).
4. Set env vars (Section 4) in Vercel.
5. Deploy; run `npx prisma migrate deploy`.
6. Replace placeholder icons & redeploy.
7. Verify features & cron.
Detailed steps: see `DEPLOYMENT.md`.

## 12. Testing Examples
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

curl -H "Authorization: Bearer $CRON_TEST_SECRET" \
  http://localhost:3000/api/cron/mood-prompt-test
```

## 13. Troubleshooting
- Auth fails: Check `SESSION_SECRET`, browser cookies.
- DB errors: Verify `DATABASE_URL`; run migrations.
- Push fails: Confirm HTTPS (prod), service worker registration, permission granted.
- Cron silent: Correct secrets + `vercel.json` present.
- Notice repost blocked: Partner has not marked seen or cooldown still active.

## 14. Maintenance
- Weekly: Review logs & queue size.
- Monthly: Purge read notifications >30d.
- Quarterly: Dependency & security updates.

## 15. Roadmap
- Real-time (WebSockets)
- Dark mode & accessibility improvements
- Profile & notification preferences
- Gossip history/archive
- Analytics & error tracking

## 16. Security Notes
- Secrets never committed; `.env*` ignored.
- Cron endpoints require Bearer tokens.
- Minimal user data surface (username only).

## 17. License
Private project – All rights reserved.

---
Consolidated README replacing prior fragmented docs.
