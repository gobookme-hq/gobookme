# 🚀 GoBookMe

GoBookMe is a modern, high-performance platform designed to empower small businesses and local communities through intelligent business discovery and seamless booking experiences.

Built on top of a robust monorepo architecture, GoBookMe combines the flexibility of **Next.js** with the power of **Firebase Data Connect** and **Prisma** to create a scalable, enterprise-grade solution for local directories and scheduling.

---

## ✨ Key Features

### 🏢 Intelligent Business Listings
A custom-built directory engine located in `packages/features/business-listings`.
- **Dynamic Discovery**: Browse businesses by category, location (e.g., Champaign Directory), and ratings.
- **Professional Submission**: A streamlined onboarding flow for businesses to register and manage their presence.
- **Analytics & Insights**: Built-in tracking for listing performance and user engagement.

### 💳 Stripe Connect Payments
Business owners can accept payments directly from clients at the time of booking.
- **Self-Serve Onboarding**: Owners connect their Stripe account from Settings → Payments via OAuth — no manual key sharing required.
- **Per-Booking Payments**: Enable "Require payment" on any event type and set a price; funds transfer directly to the business's Stripe account.
- **Payment Page**: Clients complete payment via a Stripe-powered checkout after booking (`/payment/[uid]`).
- **Hold & Capture**: Supports both immediate charge (`ON_BOOKING`) and card-hold (`HOLD`) payment options.

### 🔌 Firebase Data Connect Integration
GoBookMe is a pioneer in using **Firebase Data Connect**, Google's latest managed GraphQL service.
- **Schema-First Development**: Data models are defined in `dataconnect/schema/schema.gql`.
- **Cloud SQL Sync**: Real-time synchronization between your GraphQL layer and PostgreSQL.
- **Typed Operations**: Fully typed queries and mutations for maximum developer productivity.

### 🗓️ Advanced Scheduling (Cal.com Core)
Leverages the world-class scheduling infrastructure of Cal.com, re-branded and extended for GoBookMe.
- **Monorepo Design**: Shared packages for UI components, branding, and logic.
- **Customizable Workflows**: Tailor the booking experience to specific business needs.

---

## 🛠️ Architecture

GoBookMe uses a **Turbo-powered monorepo** structure:

- **`apps/web`**: The main Next.js application.
- **`packages/features/business-listings`**: Core business directory logic and services.
- **`packages/prisma`**: Database schema and client management.
- **`dataconnect/`**: Firebase Data Connect configuration, schemas, and queries.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: `v18+`
- **Yarn**: `v4.12.0+`
- **PostgreSQL**: Local instance or Docker.
- **Firebase CLI**: `npm i -g firebase-tools`

### 2. Installation
```bash
git clone https://github.com/[username]/gobookme.git
cd gobookme
yarn install
```

### 3. Environment Setup
Copy the example environment file and fill in your details:
```bash
cp .env.example .env
```

Key environment variables to configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `CALENDSO_ENCRYPTION_KEY` | 32-char AES key — `openssl rand -base64 24` |
| `STRIPE_PRIVATE_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe publishable key (`pk_live_...` or `pk_test_...`) |
| `STRIPE_CLIENT_ID` | Stripe Connect platform ID (`ca_...`) — from Stripe Dashboard → Connect → Settings |
| `STRIPE_WEBHOOK_SECRET_APPS` | Webhook secret (`whsec_...`) — from Stripe Dashboard → Webhooks |

### 4. Database Setup
```bash
yarn prisma db push
yarn db-seed
```

### 5. Firebase Data Connect Setup
```bash
firebase login
firebase emulators:start --only dataconnect
```

### 6. Run Development Server
```bash
yarn dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application in action.

---

## 💳 Stripe Setup (for payments)

1. Create a [Stripe account](https://stripe.com) and enable Connect in your Dashboard.
2. Copy your **Platform ID** (`ca_...`) from Stripe Dashboard → Connect → Settings → `STRIPE_CLIENT_ID`.
3. Add a webhook endpoint pointing to `https://yourdomain.com/api/integrations/stripepayment/webhook` and set `STRIPE_WEBHOOK_SECRET_APPS`.
   - Required events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `account.updated`
4. Business owners connect their Stripe accounts from **Settings → Payments** in the app.

---

## 🧪 Testing & Quality

GoBookMe is built with reliability in mind:
- **Type checking**: `yarn type-check:ci --force`
- **Unit Tests**: `TZ=UTC yarn test`
- **E2E Tests**: `PLAYWRIGHT_HEADLESS=1 yarn e2e`
- **Linting**: `yarn biome check --write .`

---

## 📄 License

GoBookMe is licensed under the [AGPL-3.0 License](LICENSE).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) to get started.

---

<p align="center">
  Proudly built for the community by the GoBookMe Team.
</p>
