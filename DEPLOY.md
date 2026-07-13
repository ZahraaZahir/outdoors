# Outdoors — Deployment Guide

## Architecture

```
Vercel (Frontend)          Railway (Backend)
┌─────────────┐           ┌──────────────────┐
│  React/Vite │───API───▶ │  NestJS API      │
│  /apps/     │  HTTPS    │  Port 3000       │
│  frontend   │           │                  │
└─────────────┘           │  ┌────────────┐  │
                          │  │ PostgreSQL │  │
                          │  └────────────┘  │
                          │  ┌────────────┐  │
                          │  │   Redis    │  │
                          │  └────────────┘  │
                          └──────────────────┘
```

---

## Part 1: Railway (API + Databases)

### Step 1 — Create project

```bash
railway login
railway init --name outdoors
```

### Step 2 — Add databases

```bash
railway add --database postgres --json
railway add --database redis --json
```

This creates managed PostgreSQL and Redis with auto-generated connection strings.

### Step 3 — Add API service

Create an empty service, then wire it to your GitHub repo:

```bash
railway add --service api --json
```

Then link it to your repo. Run from the project root:

```bash
railway link
# select: outdoors > production > api
```

Set the source to your GitHub repo:

```bash
railway environment edit --service-config api source.repo https://github.com/ZahraaZahir/outdoors.git
railway environment edit --service-config api source.branch main
```

### Step 4 — Configure API build

The API uses a Dockerfile. Tell Railway to use it:

```bash
railway environment edit --service-config api build.builder DOCKERFILE
railway environment edit --service-config api build.dockerfilePath apps/api/Dockerfile
```

Set the start command (the Dockerfile's ENTRYPOINT already handles this, but set it explicitly for safety):

```bash
railway environment edit --service-config api deploy.startCommand "cd /app/apps/api && npx prisma migrate deploy && node dist/src/main"
```

### Step 5 — Set environment variables

```bash
# Database (wired from managed Postgres)
railway variable set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service api

# Redis (wired from managed Redis)
railway variable set REDIS_URL='${{Redis.REDIS_URL}}' --service api

# JWT secret (generate a new one — do NOT reuse the dev secret)
railway variable set JWT_SECRET="$(openssl rand -hex 32)" --service api

# CORS — set AFTER frontend is deployed (update with your Vercel URL)
railway variable set CORS_ORIGIN='https://outdoors.vercel.app' --service api

# Port
railway variable set PORT=3000 --service api

# Node environment
railway variable set NODE_ENV=production --service api
```

### Step 6 — Generate a public domain

```bash
railway domain --service api --json
```

This gives you a URL like `https://api-xxxx.up.railway.app`. **Copy this** — you'll need it for Vercel.

### Step 7 — Seed the database

After the first successful deploy, SSH in and run the seed:

```bash
railway run npx prisma migrate deploy
railway run node -e "
const { PrismaClient } = require('./apps/api/src/generated/prisma');
const prisma = new PrismaClient();
async function seed() {
  // Add your seed logic here, or run the NestJS seed command
  await prisma.\$disconnect();
}
seed();
"
```

Or simply run the existing seed script from your local machine with the production database:

```bash
DATABASE_URL="<your-railway-postgres-url>" npx prisma migrate deploy
```

---

## Part 2: Vercel (Frontend)

### Step 1 — Import repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `ZahraaZahir/outdoors`
3. Configure:

| Field | Value |
|---|---|
| Framework Preset | Vite |
| Root Directory | `apps/frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Step 2 — Set environment variables

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api-xxxx.up.railway.app` (your Railway API domain) |

### Step 3 — Deploy

Click **Deploy**. Vercel builds and deploys automatically.

### Step 4 — Update Railway CORS

Now that you have the Vercel URL, update CORS on Railway:

```bash
railway variable set CORS_ORIGIN='https://outdoors-xxxx.vercel.app' --service api
```

---

## Part 3: Verify

1. Open your Vercel URL
2. Register a new account
3. Check the Railway logs for the OTP:

```bash
railway logs --service api --lines 50
```

4. Enter the OTP, verify, and you're in
5. Browse tours, create a booking as a user, promote yourself to admin via the database

### Promote yourself to admin

```bash
railway run npx prisma studio
```

Find your user in the `User` table and change `role` to `ADMIN`.

Or use a direct SQL query:

```bash
railway run psql "$DATABASE_URL" -c "UPDATE \"User\" SET role = 'ADMIN' WHERE phone_number = '+9647XXXXXXXXX';"
```

---

## Useful Commands

```bash
# Check API status
railway status

# View API logs
railway logs --service api --lines 100

# Redeploy API
railway redeploy --service api --yes

# Open Prisma Studio (browse database)
railway run npx prisma studio

# Check frontend build logs
# → Vercel dashboard > Project > Deployments > click latest
```

---

## Environment Variables Summary

### Railway — API Service

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-generated by Postgres plugin |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Auto-generated by Redis plugin |
| `JWT_SECRET` | Manual | Generate with `openssl rand -hex 32` |
| `CORS_ORIGIN` | Manual | Your Vercel frontend URL |
| `PORT` | Manual | `3000` |
| `NODE_ENV` | Manual | `production` |

### Vercel — Frontend

| Variable | Notes |
|---|---|
| `VITE_API_URL` | Railway API public domain (e.g. `https://api-xxxx.up.railway.app`) |

---

## Cost Estimate

| Service | Plan | Cost |
|---|---|---|
| Railway API | Hobby | $5/month |
| Railway Postgres | Hobby | $5/month |
| Railway Redis | Hobby | $5/month |
| Vercel Frontend | Hobby | $0 (non-commercial) |
| **Total** | | **~$15/month** |
