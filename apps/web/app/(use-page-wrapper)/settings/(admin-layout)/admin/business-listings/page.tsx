import process from "node:process";
import {
  type BusinessListingProductStatus,
  getBusinessListingProductStatus,
  getBusinessListingStatusDescription,
  getBusinessListingStatusLabel,
} from "@calcom/features/business-listings/lib/status";
import type { BusinessListingDTO } from "@calcom/features/business-listings/repositories/BusinessListingRepository";
import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import { BusinessClaimRequestStatus } from "@calcom/prisma/enums";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  applyAdminBusinessListingAction,
  deleteAdminBusinessListingAction,
  reviewBusinessClaimRequestAction,
  saveAdminBusinessListingAction,
  seedBusinessCategoriesAction,
} from "~/business/actions";
import { BusinessListingForm } from "~/business/components/BusinessListingForm";
import { getAdminEventTypeOptions, getAdminOwnerOptions } from "~/business/lib/server-data";

type AdminBusinessListingsPageProps = {
  searchParams: Promise<{ edit?: string; status?: string }>;
};

export default async function AdminBusinessListingsPage({ searchParams }: AdminBusinessListingsPageProps) {
  const { edit, status } = await searchParams;
  const activeStatus = normalizeStatus(status);
  const service = new BusinessListingService(prisma);
  const [{ listings, metrics, claimRequests }, categories, eventTypes, ownerOptions] = await Promise.all([
    service.listAdminListings(),
    service.listCategories(),
    getAdminEventTypeOptions(),
    getAdminOwnerOptions(),
  ]);
  const editingListing = edit ? listings.find((listing) => listing.id === edit) : null;
  const filteredListings = listings.filter(
    (listing) => getBusinessListingProductStatus(listing) === activeStatus
  );
  const statusCounts = getStatusCounts(listings);
  const seedCategoriesAction = seedBusinessCategoriesAction as unknown as string;
  const listingAction = applyAdminBusinessListingAction as unknown as string;
  const reviewClaimAction = reviewBusinessClaimRequestAction as unknown as string;
  const deleteListingAction = deleteAdminBusinessListingAction as unknown as string;
  const ownerCredentialKeys = await getOwnerCredentialKeys(listings);

  return (
    <main className="w-full space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-emphasis">Business listings</h1>
        <p className="text-sm text-subtle">
          Manage GoBookMe directory listings, ownership claims, approval, and local marketplace metrics.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <Metric label="Listings" value={metrics.totalListings} />
        <Metric label="Live" value={statusCounts.live} />
        <Metric label="Pending" value={statusCounts.pending_review} />
        <Metric label="Claimed" value={metrics.claimedListings} />
      </section>

      {categories.length === 0 ? (
        <form action={seedCategoriesAction} className="border-subtle bg-muted border p-4">
          <p className="mb-3 text-sm text-default">No marketplace categories exist yet.</p>
          <button className="bg-brand text-brand rounded-md px-4 py-2 text-sm font-medium" type="submit">
            Seed founding categories
          </button>
        </form>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Link
              key={tab.status}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                activeStatus === tab.status
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-subtle text-default"
              }`}
              href={`/settings/admin/business-listings?status=${tab.status}`}>
              {tab.label} ({statusCounts[tab.status]})
            </Link>
          ))}
          <Link
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              activeStatus === "claim_requests"
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-subtle text-default"
            }`}
            href="/settings/admin/business-listings?status=claim_requests">
            Claim Requests ({claimRequests.length})
          </Link>
        </div>
      </section>

      {activeStatus !== "claim_requests" ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-emphasis">{getTabLabel(activeStatus)} Listings</h2>
          <div className="grid gap-4">
            {filteredListings.map((listing) => (
              <AdminListingCard
                key={listing.id}
                action={listingAction}
                deleteAction={deleteListingAction}
                hasStripe={ownerCredentialKeys.has(getOwnerCredentialKey(listing))}
                listing={listing}
              />
            ))}
            {filteredListings.length === 0 ? (
              <div className="border-subtle rounded-xl border p-6 text-sm text-subtle">
                No {getTabLabel(activeStatus).toLowerCase()} listings.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeStatus === "claim_requests" ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-emphasis">Claim requests</h2>
          <div className="divide-subtle border-subtle divide-y border">
            {claimRequests.map((claimRequest) => (
              <div key={claimRequest.id} className="space-y-3 p-4">
                <div>
                  <h3 className="font-medium text-emphasis">{claimRequest.listing.displayName}</h3>
                  <p className="text-sm text-subtle">
                    {claimRequest.requesterName} · {claimRequest.requesterEmail} · {claimRequest.status}
                  </p>
                  {claimRequest.message ? (
                    <p className="mt-2 text-sm text-default">{claimRequest.message}</p>
                  ) : null}
                </div>
                {claimRequest.status === BusinessClaimRequestStatus.PENDING ? (
                  <form action={reviewClaimAction} className="flex flex-wrap items-end gap-2">
                    <input name="requestId" type="hidden" value={claimRequest.id} />
                    <label className="space-y-1">
                      <span className="text-default text-xs font-medium">Owner user</span>
                      <select
                        className="border-subtle bg-default text-default w-32 rounded-md border px-3 py-2 text-sm"
                        name="ownerUserId">
                        <option value="">No user</option>
                        {ownerOptions.users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-default text-xs font-medium">Owner team</span>
                      <select
                        className="border-subtle bg-default text-default w-32 rounded-md border px-3 py-2 text-sm"
                        name="ownerTeamId">
                        <option value="">No team</option>
                        {ownerOptions.teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="bg-brand text-brand rounded-md px-3 py-2 text-sm font-medium"
                      name="status"
                      type="submit"
                      value={BusinessClaimRequestStatus.APPROVED}>
                      Approve
                    </button>
                    <button
                      className="border-subtle rounded-md border px-3 py-2 text-sm font-medium text-default"
                      name="status"
                      type="submit"
                      value={BusinessClaimRequestStatus.REJECTED}>
                      Reject
                    </button>
                  </form>
                ) : null}
              </div>
            ))}
            {claimRequests.length === 0 ? (
              <div className="p-4 text-sm text-subtle">No claim requests.</div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-emphasis">
          {editingListing ? `Edit ${editingListing.displayName}` : "Create listing"}
        </h2>
        <BusinessListingForm
          action={saveAdminBusinessListingAction}
          categories={categories}
          eventTypes={eventTypes}
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          listing={editingListing}
          mode="admin"
          ownerTeams={ownerOptions.teams}
          ownerUsers={ownerOptions.users}
        />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-subtle bg-default border p-4">
      <p className="text-subtle text-xs font-medium uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-emphasis">{value}</p>
    </div>
  );
}

const statusTabs: { label: string; status: BusinessListingProductStatus }[] = [
  { label: "Pending Review", status: "pending_review" },
  { label: "Live", status: "live" },
  { label: "Unclaimed", status: "unclaimed" },
  { label: "Draft", status: "draft" },
  { label: "Changes Requested", status: "changes_requested" },
  { label: "Hidden", status: "hidden" },
  { label: "Rejected", status: "rejected" },
  { label: "Incomplete", status: "incomplete" },
];

function normalizeStatus(status?: string): BusinessListingProductStatus | "claim_requests" {
  if (status === "claim_requests") return status;
  if (statusTabs.some((tab) => tab.status === status)) return status as BusinessListingProductStatus;
  return "pending_review";
}

function getTabLabel(status: BusinessListingProductStatus) {
  return statusTabs.find((tab) => tab.status === status)?.label ?? getBusinessListingStatusLabel(status);
}

function getStatusCounts(listings: BusinessListingDTO[]) {
  const counts: Record<BusinessListingProductStatus, number> = {
    changes_requested: 0,
    draft: 0,
    hidden: 0,
    incomplete: 0,
    live: 0,
    pending_review: 0,
    rejected: 0,
    unclaimed: 0,
  };

  for (const listing of listings) {
    counts[getBusinessListingProductStatus(listing)] += 1;
  }
  return counts;
}

function AdminListingCard({
  action,
  deleteAction,
  hasStripe,
  listing,
}: {
  action: string;
  deleteAction: string;
  hasStripe: boolean;
  listing: BusinessListingDTO;
}) {
  const productStatus = getBusinessListingProductStatus(listing);
  const isLive = productStatus === "live";
  const hasAvailability = listing.services.some((service) => {
    const eventType = service.eventType;
    return (
      eventType.availability.length > 0 ||
      (eventType.schedule?.availability.length ?? 0) > 0 ||
      (eventType.owner?.schedules.some((schedule) => schedule.availability.length > 0) ?? false)
    );
  });

  return (
    <article className="border-subtle bg-default rounded-xl border p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-emphasis">{listing.displayName}</h3>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {getBusinessListingStatusLabel(productStatus)}
            </span>
            {listing.featured ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Featured
              </span>
            ) : null}
          </div>
          <p className="text-sm text-subtle">{getBusinessListingStatusDescription(productStatus)}</p>
          <p className="text-xs text-subtle">
            {listing.city} ·{" "}
            {listing.categories.map((item) => item.category.name).join(", ") || "No category"} ·{" "}
            {getOwnerLabel(listing)}
          </p>
          {listing.reviewNote ? (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{listing.reviewNote}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 text-xs text-subtle">
            <StatusPill label={`${listing.services.length} services`} ok={listing.services.length > 0} />
            <StatusPill label="Availability" ok={hasAvailability} />
            <StatusPill label="Stripe" ok={hasStripe} />
            <StatusPill
              label={`${listing.profileCompleteness}% complete`}
              ok={listing.profileCompleteness >= 75}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Link
            className="rounded-md border px-3 py-2 text-sm font-medium text-default"
            href={`/business/${listing.slug}?preview=1`}>
            Preview
          </Link>
          {isLive ? (
            <Link
              className="rounded-md border px-3 py-2 text-sm font-medium text-default"
              href={`/business/${listing.slug}`}>
              Public page
            </Link>
          ) : null}
          <Link
            className="rounded-md border px-3 py-2 text-sm font-medium text-default"
            href={`?edit=${listing.id}`}>
            Edit
          </Link>
          <AdminActionButton action={action} listingId={listing.id} value="approve_publish">
            Approve & Publish
          </AdminActionButton>
          <AdminActionButton action={action} listingId={listing.id} value="hide">
            Hide
          </AdminActionButton>
          <AdminActionButton
            action={action}
            listingId={listing.id}
            value={listing.featured ? "unfeature" : "feature"}>
            {listing.featured ? "Unfeature" : "Feature"}
          </AdminActionButton>
          <details className="relative">
            <summary className="cursor-pointer rounded-md border px-3 py-2 text-sm font-medium text-default">
              Review
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border bg-default p-3 shadow-lg">
              <form action={action} className="space-y-2">
                <input name="listingId" type="hidden" value={listing.id} />
                <textarea
                  className="border-subtle bg-default text-default min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                  name="reviewNote"
                  placeholder="Explain what the owner needs to change"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
                    name="action"
                    type="submit"
                    value="request_changes">
                    Request Changes
                  </button>
                  <button
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white"
                    name="action"
                    type="submit"
                    value="reject">
                    Reject
                  </button>
                </div>
              </form>
            </div>
          </details>
          <form action={deleteAction}>
            <input name="id" type="hidden" value={listing.id} />
            <button
              className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
              type="submit">
              Delete
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function AdminActionButton({
  action,
  children,
  listingId,
  value,
}: {
  action: string;
  children: ReactNode;
  listingId: string;
  value: string;
}) {
  return (
    <form action={action}>
      <input name="listingId" type="hidden" value={listingId} />
      <button
        className="rounded-md border px-3 py-2 text-sm font-medium text-default"
        name="action"
        type="submit"
        value={value}>
        {children}
      </button>
    </form>
  );
}

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"
          : "rounded-full bg-slate-100 px-2.5 py-1 text-slate-500"
      }>
      {label}
    </span>
  );
}

function getOwnerLabel(listing: BusinessListingDTO) {
  if (listing.ownerTeam) return `Team: ${listing.ownerTeam.name}`;
  if (listing.ownerUser) return `Owner: ${listing.ownerUser.name || listing.ownerUser.email}`;
  return "Unclaimed";
}

function getOwnerCredentialKey(listing: BusinessListingDTO) {
  if (listing.ownerTeamId) return `team:${listing.ownerTeamId}`;
  if (listing.ownerUserId) return `user:${listing.ownerUserId}`;
  return "none";
}

async function getOwnerCredentialKeys(listings: BusinessListingDTO[]) {
  const userIds = listings.map((listing) => listing.ownerUserId).filter((id): id is number => !!id);
  const teamIds = listings.map((listing) => listing.ownerTeamId).filter((id): id is number => !!id);
  if (userIds.length === 0 && teamIds.length === 0) return new Set<string>();

  const credentials = await prisma.credential.findMany({
    where: {
      appId: "stripe",
      OR: [{ userId: { in: userIds } }, { teamId: { in: teamIds } }],
    },
    select: {
      userId: true,
      teamId: true,
    },
  });

  return new Set(
    credentials.map((credential) =>
      credential.teamId
        ? `team:${credential.teamId}`
        : credential.userId
          ? `user:${credential.userId}`
          : "none"
    )
  );
}
