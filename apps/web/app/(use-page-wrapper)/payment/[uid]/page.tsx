import { APP_NAME } from "@calcom/lib/constants";
import prisma from "@calcom/prisma";
import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { withAppDirSsr } from "app/WithAppDirSsr";
import type { GetServerSidePropsContext } from "next";
import { cookies, headers } from "next/headers";
import PaymentPage from "./PaymentPage";

type PaymentPageProps = {
  payment: {
    id: number;
    success: boolean;
    refunded: boolean;
    amount: number;
    currency: string;
    paymentOption: string | null;
    data: Record<string, unknown>;
    appId?: string | null;
  };
  clientSecret?: string | null;
  booking: {
    id: number;
    uid: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    paid: boolean;
    description?: string | null;
    location?: string | null;
  };
  eventType: {
    id: number;
    title: string;
    length: number;
    price: number;
    currency: string;
    metadata: Record<string, unknown> | null;
    successRedirectUrl?: string | null;
    forwardParamsSuccessRedirect?: boolean | null;
    recurringEvent?: unknown;
  };
  profile: { theme?: string | null; hideBranding?: boolean };
  user?: { name?: string | null; username?: string | null } | null;
};

export const generateMetadata = async ({ params, searchParams }: PageProps) => {
  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), await params, await searchParams)
  );
  const eventName = props.booking.title;
  return await _generateMetadata(
    (t) => `${t("payment")} | ${eventName} | ${APP_NAME}`,
    () => "",
    undefined,
    undefined,
    `/payment/${(await params).uid}`
  );
};

const getData = withAppDirSsr<PaymentPageProps>(async (context: GetServerSidePropsContext) => {
  const uid = context.params?.uid as string | undefined;
  if (!uid) return { notFound: true as const };

  const rawPayment = await prisma.payment.findUnique({
    where: { uid },
    select: {
      id: true,
      data: true,
      success: true,
      refunded: true,
      appId: true,
      amount: true,
      currency: true,
      paymentOption: true,
      booking: {
        select: {
          id: true,
          uid: true,
          description: true,
          title: true,
          startTime: true,
          endTime: true,
          paid: true,
          location: true,
          status: true,
          eventType: {
            select: {
              id: true,
              title: true,
              length: true,
              price: true,
              currency: true,
              metadata: true,
              successRedirectUrl: true,
              forwardParamsSuccessRedirect: true,
              users: {
                select: {
                  name: true,
                  username: true,
                  hideBranding: true,
                  theme: true,
                },
              },
              team: {
                select: {
                  hideBranding: true,
                  parent: {
                    select: { hideBranding: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!rawPayment || !rawPayment.booking) {
    return { notFound: true as const };
  }

  const { booking } = rawPayment;
  const eventType = booking.eventType;
  if (!eventType) return { notFound: true as const };

  const user = eventType.users?.[0] ?? null;

  const paymentData = (rawPayment.data ?? {}) as Record<string, unknown>;
  const clientSecret = typeof paymentData.client_secret === "string" ? paymentData.client_secret : null;

  return {
    props: {
      payment: {
        id: rawPayment.id,
        success: rawPayment.success,
        refunded: rawPayment.refunded,
        amount: rawPayment.amount,
        currency: rawPayment.currency,
        paymentOption: rawPayment.paymentOption ?? null,
        data: paymentData,
        appId: rawPayment.appId ?? null,
      },
      clientSecret,
      booking: {
        id: booking.id,
        uid: booking.uid,
        title: booking.title,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        status: booking.status,
        paid: booking.paid,
        description: booking.description ?? null,
        location: booking.location ?? null,
      },
      eventType: {
        id: eventType.id,
        title: eventType.title,
        length: eventType.length,
        price: eventType.price,
        currency: eventType.currency,
        metadata: (eventType.metadata ?? null) as Record<string, unknown> | null,
        successRedirectUrl: eventType.successRedirectUrl ?? null,
        forwardParamsSuccessRedirect: eventType.forwardParamsSuccessRedirect ?? null,
      },
      profile: {
        theme: user?.theme ?? null,
        hideBranding: !!(
          eventType.team?.hideBranding ||
          eventType.team?.parent?.hideBranding ||
          user?.hideBranding
        ),
      },
      user: user ? { name: user.name, username: user.username } : null,
    },
  };
});

const ServerPage = async ({ params, searchParams }: PageProps) => {
  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), await params, await searchParams)
  );

  return <PaymentPage {...props} />;
};
export default ServerPage;
