import Stripe from "stripe";

import { handlePaymentSuccess } from "@calcom/app-store/_utils/payments/handlePaymentSuccess";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { HttpError } from "@calcom/lib/http-error";
import { distributedTracing } from "@calcom/lib/tracing/factory";
import prisma from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";

import { metadata } from "../_metadata";

function readStripeAccount(data: Prisma.JsonValue) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const stripeAccount = data.stripeAccount;
  return typeof stripeAccount === "string" && stripeAccount.length > 0 ? stripeAccount : null;
}

export async function syncStripePaymentSuccess({
  paymentIntentId,
  bookingUid,
  paymentId,
}: {
  paymentIntentId: string;
  bookingUid?: string;
  paymentId?: number;
}) {
  const stripePrivateKey = process.env.STRIPE_PRIVATE_KEY;
  if (!stripePrivateKey) {
    throw new ErrorWithCode(ErrorCode.MissingPaymentCredential, "Stripe private key is not configured");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      externalId: paymentIntentId,
      ...(paymentId ? { id: paymentId } : {}),
    },
    select: {
      id: true,
      amount: true,
      bookingId: true,
      currency: true,
      data: true,
      success: true,
      booking: {
        select: {
          uid: true,
        },
      },
    },
  });

  if (!payment || !payment.booking) {
    throw new ErrorWithCode(ErrorCode.NotFound, "Stripe payment record was not found");
  }

  if (bookingUid && payment.booking.uid !== bookingUid) {
    throw new ErrorWithCode(ErrorCode.Forbidden, "Stripe payment does not belong to this booking");
  }

  if (payment.success) {
    return { bookingId: payment.bookingId, paymentId: payment.id, status: "already_synced" as const };
  }

  const stripeAccount = readStripeAccount(payment.data);
  if (!stripeAccount) {
    throw new ErrorWithCode(ErrorCode.MissingPaymentCredential, "Stripe connected account was not found");
  }

  const stripe = new Stripe(stripePrivateKey, {
    apiVersion: "2020-08-27",
  });
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, undefined, {
    stripeAccount,
  });

  if (paymentIntent.status !== "succeeded") {
    throw new ErrorWithCode(ErrorCode.BadRequest, "Stripe payment has not succeeded yet");
  }

  if (paymentIntent.amount !== payment.amount || paymentIntent.currency !== payment.currency.toLowerCase()) {
    throw new ErrorWithCode(ErrorCode.BadRequest, "Stripe payment amount or currency does not match");
  }

  const traceContext = distributedTracing.createTrace("stripepayment_sync_success", {
    meta: { paymentId: payment.id, bookingId: payment.bookingId },
  });

  try {
    await handlePaymentSuccess({
      paymentId: payment.id,
      bookingId: payment.bookingId,
      appSlug: metadata.slug,
      traceContext,
    });
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 200) {
      return { bookingId: payment.bookingId, paymentId: payment.id, status: "synced" as const };
    }
    throw error;
  }

  return { bookingId: payment.bookingId, paymentId: payment.id, status: "synced" as const };
}
