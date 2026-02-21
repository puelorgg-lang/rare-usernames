# Deployment Plan: Rare Usernames Project

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Vercel)"
        A[Next.js 14 App Router]
    end
    
    subgraph "Database (Neon PostgreSQL)"
        B[PostgreSQL Database]
    end
    
    subgraph "Bot Service (Render)"
        C[monitor.js Node.js]
    end
    
    subgraph "External Services"
        D[Discord API]
        E[Stripe]
        F[MercadoPago]
    end
    
    A --> B
    C --> A
    C --> D
    A --> E
    A --> F
```

## Important Note About Heroku

**Heroku has discontinued their free tier** (November 2022) and PostgreSQL addons now require paid plans. For a better and free alternative, this plan uses:
- **Neon** (free PostgreSQL) or **Supabase** for the database
- **Vercel** for Next.js (native support, free tier available)
- **Render** or **Fly.io** for the monitor.js bot

---

## Step 1: Prepare the Project for Deployment

### 1.1 Update Prisma Schema for PostgreSQL

Create a new production schema file or modify the existing one:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Models remain the same...
model User {
  id                      String             @id @default(uuid())
  discordId              String             @unique @map("discord_id")
  email                  String             @unique
  image                  String?
  role                   String             @default("USER")
  subscriptionStatus     String             @default("INACTIVE")
  subscriptionPlan       String?
  subscriptionExpiresAt  DateTime?          @map("subscription_expires_at")
  createdAt              DateTime           @default(now()) @map("created_at")
  updatedAt              DateTime           @updatedAt @map("updated_at")

  @@map("users")
}

model Username {
  id            String    @id @default(uuid())
  name          String
  platform      String
  category      String
  status        String    @default("AVAILABLE")
  availableDate DateTime? @map("available_date")
  foundAt       DateTime  @default(now()) @map("found_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  @@unique([name, platform])
  @@map("usernames")
}
```

### 1.2 Create Environment Variables Template

Create a `.env.example` file (do not commit secrets):

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Auth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="generate-a-secure-random-string"

# Discord
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
DISCORD_TOKEN="your-bot-token"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="your-public-key"
MERCADOPAGO_ACCESS_TOKEN="your-access-token"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## Step 2: Set Up PostgreSQL Database (Neon)

### 2.1 Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project: "rare-usernames"
4. Copy the connection string (format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)

### 2.2 Run Prisma Migrations
```bash
# Install dependencies
npm install

# Generate Prisma Client for PostgreSQL
npx prisma generate

# Push schema to Neon database
npx prisma db push
```

---

## Step 3: Deploy Next.js to Vercel

### 3.1 Prepare for Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Or push to GitHub and import in Vercel dashboard

### 3.2 Configure Vercel
1. Import project from GitHub
2. Framework Preset: Next.js
3. Build Command: `npm run build` (or `next build`)
4. Output Directory: `.next`
5. Install Command: `npm install`

### 3.3 Add Environment Variables in Vercel Dashboard
Go to Settings → Environment Variables and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://rare-usernames.vercel.app`) |
| `NEXTAUTH_SECRET` | Generated secret |
| `DISCORD_CLIENT_ID` | From Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | From Discord Developer Portal |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Your MercadoPago public key |
| `MERCADOPAGO_ACCESS_TOKEN` | Your MercadoPago access token |

### 3.4 Update monitor.js to Use Production URL
Change in `monitor.js` line 8:
```javascript
const SITE_URL = 'https://your-project.vercel.app';
```

### 3.5 Deploy
```bash
vercel --prod
```

Or push to GitHub and Vercel will auto-deploy.

---

## Step 4: Deploy monitor.js to Render

### 4.1 Create render.yaml or use Dashboard

**Option A: Via render.yaml (recommended)**
Create `render.yaml` in project root:

```yaml
services:
  - type: worker
    name: monitor-bot
    env: node
    buildCommand: npm install
    startCommand: node monitor.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DISCORD_TOKEN
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: SITE_URL
        value: https://your-project.vercel.app
```

**Option B: Via Render Dashboard**
1. Go to [render.com](https://render.com)
2. Create New → Web Service
3. Connect your GitHub repository
4. Configure:
   - Name: `monitor-bot`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node monitor.js`

### 4.2 Add Environment Variables in Render
Add the following in Render dashboard:
- `DISCORD_TOKEN` = Your Discord bot token
- `DATABASE_URL` = Your Neon PostgreSQL connection string
- `SITE_URL` = Your Vercel URL
- `NODE_ENV` = production

---

## Step 5: Configure Discord Developer Portal

### 5.1 Update Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. OAuth2 → Redirects
4. Add: `https://your-domain.vercel.app/api/auth/callback/discord`

### 5.2 Update Discord Bot
1. Bot section
2. Reset token if needed
3. Enable Message Content Intent

---

## Step 6: Configure Stripe Webhooks

### 6.1 Set Up Stripe CLI (for local testing)
```bash
# Download and install Stripe CLI
# Then forward webhooks locally:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 6.2 Configure Production Webhooks
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.*`

---

## Step 7: Final Configuration Checklist

### 7.1 Verify All Environment Variables

| Service | Variable | Required |
|---------|----------|----------|
| Database | `DATABASE_URL` | ✅ |
| NextAuth | `NEXTAUTH_URL` | ✅ |
| NextAuth | `NEXTAUTH_SECRET` | ✅ |
| Discord OAuth | `DISCORD_CLIENT_ID` | ✅ |
| Discord OAuth | `DISCORD_CLIENT_SECRET` | ✅ |
| Discord Bot | `DISCORD_TOKEN` | ✅ (monitor.js only) |
| Stripe | `STRIPE_SECRET_KEY` | ✅ |
| Stripe | `STRIPE_WEBHOOK_SECRET` | ✅ |
| MercadoPago | `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | ✅ |
| MercadoPago | `MERCADOPAGO_ACCESS_TOKEN` | ✅ |

### 7.2 Test the Deployment

1. **Test Next.js frontend**: Visit your Vercel URL
2. **Test Discord OAuth**: Try signing in with Discord
3. **Test monitor.js**: Send a test message in monitored Discord channels
4. **Test database**: Check if usernames are being saved
5. **Test payments**: If configured, test Stripe/MercadoPago checkout

---

## Summary: Service Costs

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | ✅ Yes | Next.js hosting |
| Neon | ✅ Yes | PostgreSQL (1 project free) |
| Render | ✅ Yes | Node.js worker (sleeps after 15min) |
| Discord | ✅ Free | Bot API |
| Stripe | ✅ Free | No fees for test mode |
| MercadoPago | ✅ Free | Test mode available |

---

## Troubleshooting

### Common Issues

1. **Prisma connection error**: Ensure `?sslmode=require` is in your Neon connection string
2. **Discord OAuth error**: Check redirect URI matches exactly
3. **Monitor.js not sending data**: Verify SITE_URL is HTTPS in production
4. **Database not connecting**: Check IP whitelist in Neon dashboard

### Useful Commands

```bash
# Reset database (development only)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Check Prisma generate
npx prisma --version
```

---

## Files to Update for Deployment

1. `prisma/schema.prisma` - Change `provider = "sqlite"` to `"postgresql"`
2. `monitor.js` line 8 - Change `SITE_URL` to production URL
3. Create `.env.production` with all required variables
4. Update Discord OAuth redirect URIs
5. Configure Stripe/MercadoPago webhook URLs

---

*Plan created for: Rare Usernames Project*
*Last updated: 2026-02-21*
