"use client";

import {
  GOBOOKME_MARKETPLACE_CATEGORIES,
  GOBOOKME_SERVICE_AREAS,
} from "@calcom/features/business-listings/lib/constants";
import {
  getBusinessListingChecklist,
  getBusinessListingProductStatus,
  getBusinessListingStatusDescription,
  getBusinessListingStatusLabel,
} from "@calcom/features/business-listings/lib/status";
import type { BusinessListingDTO } from "@calcom/features/business-listings/repositories/BusinessListingRepository";
import { BusinessListingApprovalStatus } from "@calcom/prisma/enums";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";
import { AddressAutocomplete } from "./AddressAutocomplete";

type BusinessListingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitAction?: (formData: FormData) => void | Promise<void>;
  listing?: BusinessListingDTO | null;
  categories: { slug: string; name: string }[];
  eventTypes: { id: number; title: string; slug: string }[];
  googleMapsApiKey?: string;
  mode: "admin" | "owner" | "submit";
  ownerTeams?: { id: number; name: string; slug: string | null }[];
  ownerUsers?: { id: number; name: string | null; email: string }[];
  payoutEmail?: string | null;
  stripeConnected?: boolean;
};

function hasCategory(listing: BusinessListingDTO | null | undefined, slug: string) {
  return listing?.categories.some((item) => item.category.slug === slug) ?? false;
}

function hasService(listing: BusinessListingDTO | null | undefined, eventTypeId: number) {
  return listing?.services.some((service) => service.eventType.id === eventTypeId) ?? false;
}

export function BusinessListingForm({
  action,
  submitAction,
  listing,
  categories,
  eventTypes,
  googleMapsApiKey,
  mode,
  ownerTeams = [],
  ownerUsers = [],
  payoutEmail,
  stripeConnected = false,
}: BusinessListingFormProps) {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    void Promise.resolve(formAction(formData)).finally(() => setIsPending(false));
  };

  const logoPreview = listing?.photos[0] ?? null;
  const displayInitials = getInitials(listing?.displayName ?? "");
  const status = listing ? getBusinessListingProductStatus(listing) : "draft";
  const checklist = listing ? getBusinessListingChecklist(listing) : [];
  const canSubmitForReview = mode === "owner" && status !== "pending_review" && status !== "live";
  const formAction = canSubmitForReview && submitAction ? submitAction : action;
  const serviceAreas: readonly string[] = GOBOOKME_SERVICE_AREAS;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {listing ? <input name="id" type="hidden" value={listing.id} /> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Business Information</h2>
            <p className="mt-1 text-sm text-slate-500">Keep your public GoBookME profile accurate.</p>
          </div>
          <span className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 sm:inline-flex">
            Public profile
          </span>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Business Name">
              <input
                className={inputClassName}
                name="displayName"
                required
                placeholder="Your business name"
                defaultValue={listing?.displayName ?? ""}
              />
            </Field>
            {mode === "admin" ? (
              <Field label="Slug">
                <input
                  className={inputClassName}
                  name="slug"
                  placeholder="auto-generated"
                  defaultValue={listing?.slug ?? ""}
                />
              </Field>
            ) : (
              <Field label="Primary city">
                <input
                  className={inputClassName}
                  name="city"
                  placeholder="Champaign, Chicago, Austin..."
                  defaultValue={listing?.city ?? "champaign"}
                />
              </Field>
            )}
          </div>

          <Field label="Description">
            <textarea
              className={`${inputClassName} min-h-32 resize-y leading-6`}
              name="description"
              placeholder="Describe what you offer, who you help, and why customers should book with you."
              defaultValue={listing?.description ?? ""}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            {mode === "admin" ? (
              <Field label="Primary city">
                <input
                  className={inputClassName}
                  name="city"
                  placeholder="Champaign, Chicago, Austin..."
                  defaultValue={listing?.city ?? "champaign"}
                />
              </Field>
            ) : null}
            <Field
              label="Service area"
              helper="Where customers can book you. Use categories for what you offer.">
              <select
                className={inputClassName}
                name="neighborhood"
                defaultValue={listing?.neighborhood ?? ""}>
                <option value="">Select service area</option>
                {listing?.neighborhood && !serviceAreas.includes(listing.neighborhood) ? (
                  <option value={listing.neighborhood}>{listing.neighborhood}</option>
                ) : null}
                {serviceAreas.map((serviceArea) => (
                  <option key={serviceArea} value={serviceArea}>
                    {serviceArea}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Address">
            <AddressAutocomplete
              apiKey={googleMapsApiKey}
              defaultAddress={listing?.address ?? ""}
              defaultPlaceId={listing?.googlePlaceId}
              defaultLatitude={listing?.latitude}
              defaultLongitude={listing?.longitude}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Phone">
              <input
                className={inputClassName}
                name="phone"
                placeholder="(555) 123-4567"
                defaultValue={listing?.phone ?? ""}
              />
            </Field>
            <Field label="Website">
              <input
                className={inputClassName}
                name="website"
                type="url"
                placeholder="https://yourbusiness.com"
                defaultValue={listing?.website ?? ""}
              />
            </Field>
            <Field label="Instagram">
              <input
                className={inputClassName}
                name="instagram"
                placeholder="@business"
                defaultValue={listing?.instagram ?? ""}
              />
            </Field>
          </div>

          <Field label="Business Images">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
              {logoPreview ? (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img alt="Business preview" className="h-full w-full object-cover" src={logoPreview} />
                </div>
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-2xl font-black text-blue-600">
                  {displayInitials}
                </div>
              )}
              <textarea
                className={`${inputClassName} min-h-20 bg-white`}
                name="photos"
                placeholder="One image URL per line. The first image is used as the public logo/card image."
                defaultValue={listing?.photos.join("\n") ?? ""}
              />
            </div>
          </Field>
        </div>

        {mode === "admin" ? (
          <AdminControls listing={listing} ownerTeams={ownerTeams} ownerUsers={ownerUsers} />
        ) : null}

        <div className="mt-8 flex justify-end">
          <button
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            disabled={isPending}
            type="submit">
            {isPending
              ? "Saving..."
              : canSubmitForReview || mode === "submit"
                ? "Submit for Review"
                : "Save Changes"}
          </button>
        </div>
      </section>

      <aside className="space-y-5">
        {listing ? <ListingStatusCard checklist={checklist} status={status} /> : null}

        <SideCard title="Service Categories">
          <div className="space-y-3">
            {categoryOptions(categories).map((category) => (
              <ModernCheckbox
                key={category.slug}
                checked={hasCategory(listing, category.slug)}
                label={category.name}
                name="categorySlugs"
                value={category.slug}
              />
            ))}
            <label className="block space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Custom category
              </span>
              <input
                className={inputClassName}
                name="categorySlugs"
                placeholder="e.g. wedding makeup, AI consulting"
              />
            </label>
          </div>
        </SideCard>

        <SideCard title="Services from your event types">
          <div className="space-y-3">
            {eventTypes.map((eventType) => (
              <ModernCheckbox
                key={eventType.id}
                checked={hasService(listing, eventType.id)}
                label={eventType.title}
                name="eventTypeIds"
                value={String(eventType.id)}
              />
            ))}
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
              href="/event-types">
              <Icon name="plus" className="h-4 w-4" />
              Add New Service
            </Link>
          </div>
        </SideCard>

        <PaymentSettingsCard payoutEmail={payoutEmail} stripeConnected={stripeConnected} />
      </aside>
    </form>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

function Field({ children, helper, label }: { children: ReactNode; helper?: string; label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {helper ? <span className="block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}

function SideCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function ModernCheckbox({
  checked,
  label,
  name,
  value,
}: {
  checked: boolean;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
      <input
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        defaultChecked={checked}
        name={name}
        type="checkbox"
        value={value}
      />
      {label}
    </label>
  );
}

function PaymentSettingsCard({
  payoutEmail,
  stripeConnected,
}: {
  payoutEmail?: string | null;
  stripeConnected: boolean;
}) {
  return (
    <SideCard title="Payment Settings">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
            <input
              checked={stripeConnected}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
              readOnly
              type="checkbox"
            />
            Stripe
          </label>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              stripeConnected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
            {stripeConnected ? "Connected" : "Setup needed"}
          </span>
        </div>
        <p className="text-xs leading-5 text-slate-500">Manage payouts and payment methods</p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500">Payout Email</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-slate-800">
              {payoutEmail || "Add Stripe payout email"}
            </p>
            <Link
              className="text-sm font-semibold text-blue-700"
              href="/apps/installation/accounts?slug=stripe">
              Edit
            </Link>
          </div>
        </div>
      </div>
    </SideCard>
  );
}

function ListingStatusCard({
  checklist,
  status,
}: {
  checklist: { label: string; complete: boolean }[];
  status: ReturnType<typeof getBusinessListingProductStatus>;
}) {
  const completeCount = checklist.filter((item) => item.complete).length;
  return (
    <SideCard title="Listing Status">
      <div className="space-y-4">
        <div>
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {getBusinessListingStatusLabel(status)}
          </span>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {getBusinessListingStatusDescription(status)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Checklist</span>
            <span>
              {completeCount}/{checklist.length}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Icon
                  name={item.complete ? "circle-check" : "circle"}
                  className={`h-4 w-4 ${item.complete ? "text-emerald-600" : "text-slate-300"}`}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SideCard>
  );
}

function AdminControls({
  listing,
  ownerTeams,
  ownerUsers,
}: {
  listing?: BusinessListingDTO | null;
  ownerTeams: { id: number; name: string; slug: string | null }[];
  ownerUsers: { id: number; name: string | null; email: string }[];
}) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="mb-4 text-sm font-bold text-slate-950">Admin Ownership</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <ModernCheckbox
          checked={listing?.featured ?? false}
          label="Featured listing"
          name="featured"
          value="true"
        />
        <ModernCheckbox
          checked={listing?.foundingCustomer ?? false}
          label="Founding customer"
          name="foundingCustomer"
          value="true"
        />
        <Field label="Owner user ID">
          <select className={inputClassName} name="ownerUserId" defaultValue={listing?.ownerUserId ?? ""}>
            <option value="">No owner user</option>
            {ownerUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email} ({user.email})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Owner team ID">
          <select className={inputClassName} name="ownerTeamId" defaultValue={listing?.ownerTeamId ?? ""}>
            <option value="">No owner team</option>
            {ownerTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.slug ? `(${team.slug})` : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <input
        name="approvalStatus"
        type="hidden"
        value={listing?.approvalStatus ?? BusinessListingApprovalStatus.PENDING}
      />
      {listing ? (
        <>
          <input name="claimStatus" type="hidden" value={listing.claimStatus} />
          <input name="visibility" type="hidden" value={listing.visibility} />
        </>
      ) : null}
    </section>
  );
}

function categoryOptions(categories: { slug: string; name: string }[]) {
  const preferred = GOBOOKME_MARKETPLACE_CATEGORIES.map((category) => ({
    slug: category.slug,
    name: category.name,
  }));
  const preferredSlugs = new Set<string>(preferred.map((category) => category.slug));
  const customAndLegacy = categories.filter((category) => !preferredSlugs.has(category.slug));
  return [...preferred, ...customAndLegacy];
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "GB";
}
