import process from "node:process";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import prisma from "@calcom/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import stringify from "qs-stringify";
import type Stripe from "stripe";
import { z } from "zod";
import { getStripeAppKeys } from "../lib/getStripeAppKeys";

const log = logger.getSubLogger({ prefix: ["stripepayment:add"] });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let client_id: string;
  try {
    const stripeKeys = await getStripeAppKeys();
    client_id = stripeKeys.client_id;
  } catch (error) {
    log.error("Stripe Connect is not configured", error);
    return res.status(400).json({
      message:
        "Stripe Connect is not configured. Add STRIPE_CLIENT_ID and STRIPE_PRIVATE_KEY in the GoBookMe environment or save them in the Stripe app keys, then restart the app.",
    });
  }

  if (req.method === "GET") {
    // Get user
    const user = await prisma.user.findUnique({
      where: {
        id: req.session?.user?.id,
      },
      select: {
        email: true,
        name: true,
      },
    });

    const redirect_uri = encodeURI(`${WEBAPP_URL}/api/integrations/stripepayment/callback`);
    const stripeConnectParams: Stripe.OAuthAuthorizeUrlParams = {
      client_id,
      scope: "read_write",
      response_type: "code",
      stripe_user: {
        email: user?.email,
        first_name: user?.name || undefined,
        /** We need this so E2E don't fail for international users */
        country: process.env.NEXT_PUBLIC_IS_E2E ? "US" : undefined,
      },
      redirect_uri,
      state: typeof req.query.state === "string" ? req.query.state : undefined,
    };
    /** stringify is being dumb here */
    const params = z.record(z.any()).parse(stripeConnectParams);
    const query = stringify(params);
    /**
     * Choose Express or Standard Stripe accounts
     * @url https://stripe.com/docs/connect/accounts
     */
    // const url = `https://connect.stripe.com/express/oauth/authorize?${query}`;
    const url = `https://connect.stripe.com/oauth/authorize?${query}`;

    res.status(200).json({ url });
  }
}
