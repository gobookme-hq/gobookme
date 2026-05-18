# Firebase App Hosting — Deployment Plan

This document is an execution guide for deploying gobookme to Firebase App Hosting
with Cloud SQL (Postgres). Follow the steps in order. Do not skip verification steps.

## Context

- **GCP / Firebase project**: `gobookme-app`
- **Region**: `us-central1`
- **Stack**: Next.js 13+ App Router, Yarn/Turbo monorepo, Prisma + Postgres
- **Next.js app lives at**: `apps/web/`
- **Hosting config**: `apphosting.yaml` at repo root
- **Infrastructure script**: `scripts/setup-firebase-infra.sh`

---

## Prerequisites — Verify These First

```bash
# 1. gcloud CLI is installed and authenticated
gcloud auth login
gcloud auth application-default login
gcloud config set project gobookme-app

# 2. Firebase CLI is installed
firebase --version   # must be >= 13.x
firebase login

# 3. Billing is enabled (required for Cloud SQL and App Hosting)
gcloud billing projects describe gobookme-app

# 4. You are in the repo root
ls apphosting.yaml   # must exist
```

---

## Step 1 — Fill In and Run the Infrastructure Script

Open `scripts/setup-firebase-infra.sh` and fill in every variable in the CONFIG section:

| Variable | Where to get it |
|---|---|
| `DB_PASSWORD` | Generate: `openssl rand -base64 24` |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Generate: `openssl rand -base64 24` (must produce 32 chars) |
| `CRON_API_KEY` | Generate: `openssl rand -hex 16` |
| `CRON_SECRET` | Generate: `openssl rand -base64 32` |
| `GOOGLE_API_CREDENTIALS` | GCP Console → APIs & Services → Credentials → OAuth 2.0 Client (web) → Download JSON, paste the JSON as a single-line string |
| `GOOGLE_CALENDAR_API_KEY` | GCP Console → APIs & Services → Credentials → API key (restrict to Calendar API) |
| `SENDGRID_API_KEY` | SendGrid dashboard → Settings → API Keys |
| `SENDGRID_EMAIL` | Your verified sender email, e.g. `noreply@gobookme.app` |
| `STRIPE_*` | Stripe dashboard → Developers → API keys |
| `PAYMENT_FEE_FIXED` | Fixed fee in cents, e.g. `30` for $0.30 |
| `PAYMENT_FEE_PERCENTAGE` | Percentage as decimal, e.g. `0.029` for 2.9% |
| `FIREBASE_*` | Firebase Console → Project Settings → Your apps → SDK config |

Once filled in, run:

```bash
bash scripts/setup-firebase-infra.sh
```

**Expected output**: APIs enabled, Cloud SQL instance created (~5 min), database and
user created, all secrets uploaded to Secret Manager, IAM roles granted.

**Verify**:
```bash
# Cloud SQL instance exists
gcloud sql instances describe gobookme-prod --project=gobookme-app

# All secrets exist
gcloud secrets list --project=gobookme-app --filter="name~DATABASE_URL OR name~NEXTAUTH_SECRET"
```

---

## Step 2 — Create the App Hosting Backend (One-Time)

```bash
firebase apphosting:backends:create \
  --project=gobookme-app \
  --location=us-central1
```

When prompted:
- **GitHub repository**: connect to your gobookme repo
- **Branch**: `main`
- **App root directory**: press Enter to use repo root (where `apphosting.yaml` is)

Save the **backend ID** from the output — you'll need it in Step 3.

**Verify**:
```bash
firebase apphosting:backends:list --project=gobookme-app
```

---

## Step 3 — Link Cloud SQL to the Backend

Replace `BACKEND_ID` with the ID from Step 2:

```bash
# Get the Cloud Run service name (same as backend ID)
BACKEND_ID="<paste from step 2>"

gcloud run services update "$BACKEND_ID" \
  --add-cloudsql-instances=gobookme-app:us-central1:gobookme-prod \
  --region=us-central1 \
  --project=gobookme-app
```

This allows the Cloud Run container to connect to Cloud SQL via Unix socket
at `/cloudsql/gobookme-app:us-central1:gobookme-prod`.

**Verify**:
```bash
gcloud run services describe "$BACKEND_ID" \
  --region=us-central1 \
  --project=gobookme-app \
  --format="value(spec.template.metadata.annotations)"
# Should contain: run.googleapis.com/cloudsql-instances=gobookme-app:us-central1:gobookme-prod
```

---

## Step 4 — Run Prisma Migrations (One-Time, From Local Machine)

You cannot run migrations from Cloud Run directly. Use Cloud SQL Auth Proxy locally.

```bash
# Install Cloud SQL Auth Proxy (Mac)
curl -o cloud-sql-proxy \
  https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Start the proxy (keep this terminal open)
./cloud-sql-proxy gobookme-app:us-central1:gobookme-prod --port=5433
```

In a second terminal:

```bash
# Get the DB password you set in setup-firebase-infra.sh
DB_PASSWORD="<your db password>"

# Run migrations
DATABASE_URL="postgresql://gobookme:${DB_PASSWORD}@localhost:5433/gobookme" \
DATABASE_DIRECT_URL="postgresql://gobookme:${DB_PASSWORD}@localhost:5433/gobookme" \
yarn workspace @calcom/prisma db-deploy

# Verify migration completed
DATABASE_URL="postgresql://gobookme:${DB_PASSWORD}@localhost:5433/gobookme" \
yarn workspace @calcom/prisma migrate status
```

---

## Step 5 — Seed the App Store

This registers the allowed integrations (Google Calendar, Sendgrid, Stripe, etc.)
in the database. Must run after migrations and with real env vars set.

```bash
DB_PASSWORD="<your db password>"
GOOGLE_API_CREDENTIALS='<paste json>'  # same as what you put in setup script

DATABASE_URL="postgresql://gobookme:${DB_PASSWORD}@localhost:5433/gobookme" \
GOOGLE_API_CREDENTIALS="$GOOGLE_API_CREDENTIALS" \
yarn ts-node --project tsconfig.json scripts/seed-app-store.ts
```

**Verify**:
```bash
DATABASE_URL="postgresql://gobookme:${DB_PASSWORD}@localhost:5433/gobookme" \
npx prisma studio --schema=packages/prisma/schema.prisma
# Open App table — should have google-calendar, apple-calendar, google-meet, etc.
```

---

## Step 6 — First Deploy

```bash
git add -A
git commit -m "chore: add Firebase App Hosting config and infra scripts"
git push origin main
```

Firebase App Hosting auto-deploys on push to `main`. Watch progress:

```bash
firebase apphosting:rollouts:list \
  --backend="$BACKEND_ID" \
  --project=gobookme-app
```

Or watch in Firebase Console → App Hosting → your backend → Rollouts.

**Build takes 10-15 min** on first run (Turborepo + Next.js + all packages).

---

## Step 7 — Verify the Deployment

```bash
# Get the deployed URL
firebase apphosting:backends:get "$BACKEND_ID" --project=gobookme-app

# Check the app loads
curl -I https://<your-app-hosting-url>/

# Check the health endpoint
curl https://<your-app-hosting-url>/api/version
# Expected: {"version":"x.x.x"}

# Check auth works (should redirect to /auth/login)
curl -I https://<your-app-hosting-url>/settings
# Expected: 307 redirect to login
```

---

## Step 8 — Custom Domain (After App Works)

```bash
firebase apphosting:domains:create gobookme.app \
  --backend="$BACKEND_ID" \
  --project=gobookme-app
```

Follow the DNS instructions shown — add the CNAME records to your domain registrar.
Then update these values in `apphosting.yaml` and redeploy:

```yaml
# Change all three from Firebase URL to your custom domain:
NEXTAUTH_URL: https://gobookme.app
NEXT_PUBLIC_WEBAPP_URL: https://gobookme.app
NEXT_PUBLIC_WEBSITE_URL: https://gobookme.app
NEXT_PUBLIC_EMBED_LIB_URL: https://gobookme.app/embed/embed.js
```

---

## Common Failures and Fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails: `NEXTAUTH_SECRET not found` | Secret not created in Secret Manager | Re-run `setup-firebase-infra.sh` or manually: `echo -n "value" \| gcloud secrets create NEXTAUTH_SECRET --data-file=-` |
| Build fails: `Cannot find module` | Turbo cache issue | Add `--force` flag to build or clear Turbo cache |
| Runtime 500: `Can't reach database` | Cloud SQL not linked to backend | Re-run Step 3 |
| Runtime 500: `PrismaClientInitializationError` | DATABASE_URL wrong format | Must be socket format: `postgresql://user:pass@/dbname?host=/cloudsql/PROJECT:REGION:INSTANCE` |
| Runtime 500: `relation does not exist` | Migrations not run | Run Step 4 |
| Geolocation returns "Unknown" | Expected on Cloud Run — no geo headers without Cloudflare/CDN in front | Acceptable for now; add Cloudflare later if needed |
| App Hosting SA IAM grant fails | SA not created yet | Normal — the SA is created on first deploy. Re-run the IAM grant from the script after first deploy |

---

## Key Files Reference

```
apphosting.yaml                        # Cloud Run config (scaling, secrets)
scripts/setup-firebase-infra.sh        # One-time infra setup (Cloud SQL + secrets)
packages/prisma/schema.prisma          # Database schema
packages/app-store/gobookme-allowed-apps.ts  # Which integrations are active
apps/web/app/api/                      # API routes
```
