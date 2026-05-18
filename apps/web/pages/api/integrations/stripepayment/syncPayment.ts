import { syncStripePaymentSuccess } from "@calcom/app-store/stripepayment/lib/syncPaymentSuccess";
import { HttpError as HttpCode } from "@calcom/lib/http-error";
import { getServerErrorFromUnknown } from "@calcom/lib/server/getServerErrorFromUnknown";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestBodySchema = z.object({
  bookingUid: z.string().min(1).optional(),
  paymentId: z.number().int().positive().optional(),
  paymentIntentId: z.string().min(1),
});

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    if (req.method !== "POST") throw new HttpCode({ statusCode: 405, message: "Method Not Allowed" });

    const parsedBody = requestBodySchema.parse(req.body);
    const result = await syncStripePaymentSuccess(parsedBody);

    return res.status(200).json(result);
  } catch (_err) {
    const err = getServerErrorFromUnknown(_err);
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }
}

export default handler;
