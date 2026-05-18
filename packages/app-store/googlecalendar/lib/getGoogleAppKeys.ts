import process from "node:process";
import type { Prisma } from "@calcom/prisma/client";
import { z } from "zod";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getParsedAppKeysFromSlug from "../../_utils/getParsedAppKeysFromSlug";

const googleAppKeysSchema = z.object({
  client_id: z.string(),
  client_secret: z.string(),
  redirect_uris: z.union([z.array(z.string()), z.string().transform((url) => [url])]),
});

function keepGoogleKeyEntries(keys: Prisma.JsonValue | Record<string, unknown> | null | undefined) {
  if (!keys || typeof keys !== "object" || Array.isArray(keys)) {
    return {};
  }

  const record = keys as Record<string, unknown>;
  const keptKeys: Record<string, string | string[]> = {};

  if (typeof record.client_id === "string" && record.client_id.length > 0) {
    keptKeys.client_id = record.client_id;
  }
  if (typeof record.client_secret === "string" && record.client_secret.length > 0) {
    keptKeys.client_secret = record.client_secret;
  }
  if (typeof record.redirect_uris === "string" && record.redirect_uris.length > 0) {
    keptKeys.redirect_uris = record.redirect_uris;
  }
  if (
    Array.isArray(record.redirect_uris) &&
    record.redirect_uris.every((redirectUri): redirectUri is string => typeof redirectUri === "string")
  ) {
    keptKeys.redirect_uris = record.redirect_uris;
  }

  return keptKeys;
}

function getGoogleEnvironmentKeys() {
  if (!process.env.GOOGLE_API_CREDENTIALS) return {};

  try {
    const parsed = JSON.parse(process.env.GOOGLE_API_CREDENTIALS) as { web?: Record<string, unknown> };
    return keepGoogleKeyEntries(parsed.web);
  } catch {
    return {};
  }
}

export const getGoogleAppKeys = async () => {
  const appKeys = await getAppKeysFromSlug("google-calendar");
  return googleAppKeysSchema.parse({
    ...getGoogleEnvironmentKeys(),
    ...keepGoogleKeyEntries(appKeys),
  });
};

export const getGoogleAppKeysFromDb = async () => {
  return getParsedAppKeysFromSlug("google-calendar", googleAppKeysSchema);
};
