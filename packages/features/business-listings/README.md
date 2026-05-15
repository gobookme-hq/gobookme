# 🏢 Business Listings Feature

This package provides the core logic and services for managing business listings in the **GoBookMe** platform.

## 🚀 Overview

The Business Listings feature allows users to:
- Discover local businesses through a directory.
- Submit new business listings.
- Manage existing listings and their metadata.

## 📁 Structure

- **`services/`**: High-level business logic (e.g., `BusinessListingService`).
- **`repositories/`**: Data access layer for listings.
- **`lib/`**: Shared utilities and types.

## 🔌 Data Architecture

Business listings data is managed through a hybrid approach:
1. **Prisma**: Used for core relational data and management operations.
2. **Firebase Data Connect**: Used for high-performance, schema-first GraphQL queries in the frontend.

### Syncing with Data Connect
Data Connect schemas are located in the root `dataconnect/` directory. The service layer interacts with these models to ensure consistency across the platform.

## 🛠️ Usage

```typescript
import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";

const listingService = new BusinessListingService();
const listings = await listingService.getListings();
```
