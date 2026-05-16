import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { parseStripeConnectAppKeys } from "./appKeys";

export const getStripeAppKeys = async () => parseStripeConnectAppKeys(await getAppKeysFromSlug("stripe"));
