import process from "node:process";
import type { Prisma } from "@calcom/prisma/client";
import { appKeysSchema, connectAppKeysSchema } from "../zod";

const stripeEnvironmentKeys = {
  client_id: process.env.STRIPE_CLIENT_ID,
  client_secret: process.env.STRIPE_PRIVATE_KEY,
  public_key: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  webhook_secret: process.env.STRIPE_WEBHOOK_SECRET_APPS || process.env.STRIPE_WEBHOOK_SECRET,
};

function keepNonEmptyStringEntries(keys: Prisma.JsonValue | Record<string, unknown> | null | undefined) {
  if (!keys || typeof keys !== "object" || Array.isArray(keys)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(keys).filter((entry): entry is [string, string] => {
      const [, value] = entry;
      return typeof value === "string" && value.length > 0;
    })
  );
}

export function getStripeAppKeysParseResult(keys?: Prisma.JsonValue | Record<string, unknown> | null) {
  return appKeysSchema.safeParse({
    ...keepNonEmptyStringEntries(stripeEnvironmentKeys),
    ...keepNonEmptyStringEntries(keys),
  });
}

export function parseStripeAppKeys(keys?: Prisma.JsonValue | Record<string, unknown> | null) {
  return appKeysSchema.parse({
    ...keepNonEmptyStringEntries(stripeEnvironmentKeys),
    ...keepNonEmptyStringEntries(keys),
  });
}

export function getStripeConnectAppKeysParseResult(keys?: Prisma.JsonValue | Record<string, unknown> | null) {
  return connectAppKeysSchema.safeParse({
    ...keepNonEmptyStringEntries(stripeEnvironmentKeys),
    ...keepNonEmptyStringEntries(keys),
  });
}

export function parseStripeConnectAppKeys(keys?: Prisma.JsonValue | Record<string, unknown> | null) {
  return connectAppKeysSchema.parse({
    ...keepNonEmptyStringEntries(stripeEnvironmentKeys),
    ...keepNonEmptyStringEntries(keys),
  });
}

export function isStripeConfiguredFromEnvironment() {
  return getStripeConnectAppKeysParseResult().success;
}
