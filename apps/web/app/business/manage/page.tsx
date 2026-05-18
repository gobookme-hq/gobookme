import process from "node:process";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import {
  getBusinessListingProductStatus,
  getBusinessListingStatusDescription,
  getBusinessListingStatusLabel,
} from "@calcom/features/business-listings/lib/status";
import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  saveOwnerBusinessListingAction,
  submitExistingOwnerBusinessListingAction,
  submitOwnerBusinessListingAction,
} from "~/business/actions";
import { BusinessListingForm } from "~/business/components/BusinessListingForm";
import { DashboardSidebar } from "~/business/components/GoBookMeMarketplace";
import { getOwnerEventTypeOptions } from "~/business/lib/server-data";

type BusinessManagePageProps = {
  searchParams: Promise<{ edit?: string; error?: string; submitted?: string }>;
};

export const metadata = {
  title: "Manage business listings | GoBookME",
};

export default async function BusinessManagePage({ searchParams }: BusinessManagePageProps) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");

  const { edit, error, submitted } = await searchParams;
  const service = new BusinessListingService(prisma);
  const [listings, categories] = await Promise.all([
    service.listOwnerListings(session.user.id),
    service.listCategories(),
  ]);
  const editingListing = edit ? listings.find((listing) => listing.id === edit) : listings[0];
  if (edit && !editingListing) redirect("/business/manage?error=not-owner");

  const eventTypes = await getOwnerEventTypeOptions({
    ownerTeamId: editingListing?.ownerTeamId,
    ownerUserId: editingListing?.ownerUserId ?? session.user.id,
    userId: session.user.id,
  });
  const stripeCredential = await prisma.credential.findFirst({
    where: {
      appId: "stripe",
      ...(editingListing?.ownerTeamId ? { teamId: editingListing.ownerTeamId } : { userId: session.user.id }),
    },
    select: {
      id: true,
    },
  });
  const productStatus = editingListing ? getBusinessListingProductStatus(editingListing) : null;
  const publicPageHref =
    editingListing && productStatus === "live"
      ? `/business/${editingListing.slug}`
      : editingListing
        ? `/business/${editingListing.slug}?preview=1`
        : "/business/manage";

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <DashboardSidebar />
      <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                Go
              </span>
              GoBookME
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">Manage Your Business</h1>
            <p className="mt-2 text-sm text-slate-500">Update your business information and settings</p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            href={publicPageHref}>
            {productStatus === "live" ? "View Public Page" : "Preview Listing"}
          </Link>
        </header>

        {editingListing && productStatus ? (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  {getBusinessListingStatusLabel(productStatus)}
                </p>
                <p className="mt-1 text-sm text-blue-800">
                  {getBusinessListingStatusDescription(productStatus)}
                </p>
                {editingListing.reviewNote ? (
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-amber-800">
                    GoBookME note: {editingListing.reviewNote}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                {editingListing.profileCompleteness}% complete
              </span>
            </div>
          </div>
        ) : null}

        {submitted === "1" ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              Your listing has been submitted for review.
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              We&apos;ll approve it within 1-2 business days. You can update your details below while you
              wait.
            </p>
          </div>
        ) : null}

        {error === "not-owner" ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">You can only edit businesses you own.</p>
            <p className="mt-1 text-xs text-red-700">
              Select one of your businesses below or create a new business listing.
            </p>
          </div>
        ) : null}

        {listings.length > 1 ? (
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Your business listings">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                href={`/business/manage?edit=${listing.id}`}>
                {listing.displayName}
              </Link>
            ))}
          </nav>
        ) : null}

        {editingListing ? (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <OwnerLink href="/event-types" label="Services" />
              <OwnerLink href="/availability" label="Availability" />
              <OwnerLink href="/apps/installed/calendar" label="Connected calendars" />
              <OwnerLink href="/apps/installation/accounts?slug=stripe" label="Stripe payments" />
            </div>
            <BusinessListingForm
              action={saveOwnerBusinessListingAction}
              categories={categories}
              eventTypes={eventTypes}
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              listing={editingListing}
              mode="owner"
              payoutEmail={session.user.email}
              submitAction={submitExistingOwnerBusinessListingAction}
              stripeConnected={!!stripeCredential}
            />
          </>
        ) : (
          <BusinessListingForm
            action={submitOwnerBusinessListingAction}
            categories={categories}
            eventTypes={eventTypes}
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            mode="submit"
            payoutEmail={session.user.email}
            stripeConnected={!!stripeCredential}
          />
        )}
      </section>
    </main>
  );
}

function OwnerLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
      href={href}>
      {label}
    </Link>
  );
}
