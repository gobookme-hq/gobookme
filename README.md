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

## 🧪 Testing & Quality

GoBookMe is built with reliability in mind:
- **Unit Tests**: `yarn test`
- **E2E Tests**: `yarn test-e2e`
- **Linting**: `yarn lint`
- **Formatting**: `yarn format`

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
