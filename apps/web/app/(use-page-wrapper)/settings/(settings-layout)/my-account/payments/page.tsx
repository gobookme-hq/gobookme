import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { IS_STRIPE_ENABLED } from "@calcom/lib/constants";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { _generateMetadata } from "app/_utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import PaymentsView from "~/settings/my-account/payments-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "Payments",
    () => "Connect Stripe to accept payments from clients",
    undefined,
    undefined,
    "/settings/my-account/payments"
  );

const Page = async () => {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/settings/my-account/payments");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-cal text-xl font-semibold text-zinc-900 dark:text-zinc-100">Payments</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Connect your Stripe account to accept payments from clients when they book with you.
        </p>
      </div>
      <PaymentsView isStripeEnabled={IS_STRIPE_ENABLED} />
    </div>
  );
};

export default Page;
