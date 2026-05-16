import { handlePaymentSuccess } from "@calcom/app-store/_utils/payments/handlePaymentSuccess";
import { PrismaBookingPaymentRepository as BookingPaymentRepository } from "@calcom/features/bookings/repositories/PrismaBookingPaymentRepository";
import { IS_PRODUCTION } from "@calcom/lib/constants";
import { HttpError as HttpCode } from "@calcom/lib/http-error";
import { getServerErrorFromUnknown } from "@calcom/lib/server/getServerErrorFromUnknown";
import { distributedTracing } from "@calcom/lib/tracing/factory";
import type { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import Stripe from "stripe";
import { metadata } from "../_metadata";
import { parseStripeAppKeys } from "../lib/appKeys";

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    if (req.method !== "POST") throw new HttpCode({ statusCode: 405, message: "Method Not Allowed" });

    const appKeys: ReturnType<typeof parseStripeAppKeys> = parseStripeAppKeys();
    const stripe: Stripe = new Stripe(appKeys.client_secret, {
      apiVersion: "2020-08-27",
    });
    const webhookSecret = appKeys.webhook_secret;
    if (!webhookSecret) {
      throw new HttpCode({ statusCode: 500, message: "Stripe webhook secret is not configured" });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new HttpCode({ statusCode: 401, message: "Missing Stripe signature" });
    }

    const rawBody = await getRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type !== "payment_intent.succeeded") {
      return res.status(200).json({ message: "Webhook received but ignored" });
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingPaymentRepository = new BookingPaymentRepository();
    const payment = await bookingPaymentRepository.findByExternalIdIncludeBookingUserCredentials(
      paymentIntent.id,
      metadata.type
    );

    if (!payment) throw new HttpCode({ statusCode: 404, message: "Cal.diy: payment not found" });
    if (payment.success) return res.status(200).json({ message: "Payment already registered" });

    const traceContext = distributedTracing.createTrace("stripepayment_webhook", {
      meta: { paymentId: payment.id, bookingId: payment.bookingId },
    });
    await handlePaymentSuccess({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      appSlug: metadata.slug,
      traceContext,
    });

    return res.status(200).json({ success: true });
  } catch (_err) {
    const err = getServerErrorFromUnknown(_err);
    let stack: string | undefined;
    if (!IS_PRODUCTION) {
      stack = err.cause?.stack;
    }
    return res.status(err.statusCode).send({
      message: err.message,
      stack,
    });
  }
}

export const config = { api: { bodyParser: false } };
export default handler;
