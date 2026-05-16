"use client";

import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui/components/button";
import { showToast } from "@calcom/ui/components/toast";
import { CircleCheckIcon, CircleXIcon } from "@coss/ui/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PaymentsView({ isStripeEnabled }: { isStripeEnabled: boolean }) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data, isLoading, refetch } = trpc.viewer.apps.appCredentialsByType.useQuery(
    { appType: "stripe_payment" },
    { enabled: isStripeEnabled }
  );

  const disconnectMutation = trpc.viewer.credentials.delete.useMutation({
    onSuccess: () => {
      showToast("Stripe account disconnected", "success");
      refetch();
    },
    onError: () => {
      showToast("Failed to disconnect Stripe", "error");
    },
  });

  const stripeCredential = data?.credentials?.[0];
  const isConnected = !!stripeCredential;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch(
        `/api/integrations/stripepayment/add?state=${encodeURIComponent(
          JSON.stringify({ returnTo: "/settings/my-account/payments" })
        )}`
      );
      const { url } = await res.json();
      if (url) router.push(url);
    } catch {
      showToast("Failed to start Stripe connection", "error");
      setIsConnecting(false);
    }
  };

  if (!isStripeEnabled) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          <CircleXIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">Stripe not configured</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Set{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
                STRIPE_CLIENT_ID
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
                STRIPE_PRIVATE_KEY
              </code>
              , and{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
                NEXT_PUBLIC_STRIPE_PUBLIC_KEY
              </code>{" "}
              in your environment, then restart the app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 60 25" className="h-7 w-auto" aria-label="Stripe">
              <title>Stripe</title>
              <path
                fill="currentColor"
                className="text-[#635BFF]"
                d="M59.64 14.28h-8.06v4.01h4.64v2.58h-4.64v4.05H59.6v2.6H48.64V11.7h10.97v2.58zM40.5 27.52l-5.35-7.47-1.76 2.13v5.34h-3.13V11.7h3.13v6.97L38.79 11.7h3.68l-5.07 5.74 5.43 10.08H40.5zm-15.27-15.82h3.13v15.82h-3.13V11.7zm-9.33 13.34c1.24 0 2.33-.46 3.2-1.37l1.95 2.08c-1.3 1.4-3.08 2.27-5.2 2.27-4.12 0-6.97-2.7-6.97-8.12 0-5.04 2.73-8.24 6.9-8.24 4.12 0 6.55 3.1 6.55 7.77v1.17H9.4c.26 2.4 1.5 4.44 4.24 4.44zm-4.2-6.61h6.68c-.16-2.14-1.17-4.08-3.25-4.08-1.98 0-3.17 1.84-3.43 4.08zM0 27.52l3.49-15.82h3.25l-3.5 15.82H0z"
              />
            </svg>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Stripe</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Accept payments from clients at booking
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          ) : isConnected ? (
            <div className="flex items-center gap-2">
              <CircleCheckIcon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-zinc-400">
              <CircleXIcon className="h-4 w-4" />
              Not connected
            </div>
          )}
        </div>

        {isConnected && stripeCredential && (
          <div className="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950/30 dark:text-green-300">
            Your Stripe account is connected. Clients can pay when booking your services.
          </div>
        )}

        <div className="mt-5 flex gap-3">
          {!isConnected ? (
            <Button onClick={handleConnect} loading={isConnecting} color="primary">
              Connect Stripe
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (stripeCredential?.id) {
                  disconnectMutation.mutate({ id: stripeCredential.id });
                }
              }}
              loading={disconnectMutation.isPending}
              color="destructive">
              Disconnect
            </Button>
          )}
          <Button
            href="https://dashboard.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            color="secondary"
            EndIcon="external-link">
            Stripe Dashboard
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">How it works</h3>
        <ol className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              1
            </span>
            Connect your Stripe account above
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              2
            </span>
            On each event type, enable &ldquo;Require payment&rdquo; and set a price
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              3
            </span>
            Clients pay at booking — funds go directly to your Stripe account
          </li>
        </ol>
      </div>
    </div>
  );
}
