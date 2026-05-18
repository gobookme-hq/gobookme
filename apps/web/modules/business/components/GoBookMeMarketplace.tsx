import { GOBOOKME_MARKETPLACE_CATEGORIES } from "@calcom/features/business-listings/lib/constants";
import {
  getBusinessListingProductStatus,
  getBusinessListingStatusLabel,
} from "@calcom/features/business-listings/lib/status";
import type { BusinessListingDTO } from "@calcom/features/business-listings/repositories/BusinessListingRepository";
import { Icon } from "@calcom/ui/components/icon";
import Link from "next/link";
import { getListingCategories, getServiceBookingPath } from "../lib/listing-view-model";

const listBusinessHref = "/auth/login?callbackUrl=%2Fbusiness%2Fmanage";

const categoryFilters = [
  { name: "All", slug: "all" },
  ...GOBOOKME_MARKETPLACE_CATEGORIES.map((category) => ({
    name: category.name,
    slug: category.slug,
  })),
  { name: "More", slug: "more" },
];

const trustSignals = [
  {
    title: "Instant Confirmation",
    body: "Book and get confirmed instantly",
    icon: "calendar-check-2" as const,
  },
  {
    title: "Secure Payments",
    body: "Your payments are safe with us",
    icon: "credit-card" as const,
  },
  {
    title: "Trusted Local Businesses",
    body: "Verified and reviewed providers",
    icon: "shield-check" as const,
  },
  {
    title: "24/7 Support",
    body: "We're here to help anytime",
    icon: "messages-square" as const,
  },
];

export function GoBookMeHeader({
  compact = false,
  ctaHref = listBusinessHref,
  ctaLabel = "List Your Business",
  ctaShortLabel = "List",
  locationLabel = "Champaign, IL",
  showSearch = true,
}: {
  compact?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  ctaShortLabel?: string;
  locationLabel?: string;
  showSearch?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link className="flex shrink-0 items-center gap-2 font-bold text-blue-700" href="/champaign">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Icon name="handshake" className="h-4 w-4" />
          </span>
          <span className="text-lg">GoBookME</span>
        </Link>

        {showSearch ? (
          <div className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            <label className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm">
              <Icon name="search" className="h-4 w-4 text-slate-400" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search services (e.g., cleaner, photographer, creator...)"
                type="search"
              />
            </label>
            <button className="flex h-10 min-w-[150px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm">
              <Icon name="map-pin" className="h-4 w-4 text-slate-400" />
              {locationLabel}
              <Icon name="chevron-down" className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        ) : null}

        <nav className="ml-auto hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
          <Link className="text-blue-700" href="/champaign">
            Explore
          </Link>
          <Link href="/business">How It Works</Link>
          <Link href={listBusinessHref}>For Businesses</Link>
        </nav>
        <Link
          className="ml-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 md:ml-0"
          href={ctaHref}>
          {compact ? ctaShortLabel : ctaLabel}
        </Link>
        <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white sm:flex">
          N
        </span>
      </div>
    </header>
  );
}

export function MarketplaceHero({
  cityName = "Champaign",
  featuredListing,
}: {
  cityName?: string;
  featuredListing?: BusinessListingDTO | null;
}) {
  const featuredService = featuredListing ? getDisplayServices(featuredListing)[0] ?? null : null;
  const previewBusinessName = featuredListing ? getBusinessDisplayName(featuredListing) : "GoBookME";
  const previewServiceTitle = featuredService ? featuredService.title : "Local Service";
  const previewServicePrice = featuredService ? featuredService.price : "Browse";
  const previewServiceDuration = featuredService ? featuredService.duration : "Any time";
  const previewHref = featuredListing ? `/business/${featuredListing.slug}` : `/${slugifyCityName(cityName)}`;

  return (
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-14 lg:pt-16">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {cityName} Local Services
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
          Find local services, <span className="text-blue-600">book instantly</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Discover and book trusted local businesses in {cityName}. Real-time availability, secure payments,
          instant confirmation.
        </p>

        <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:grid-cols-[1fr_180px_120px]">
          <label className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4 text-slate-400" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search services (e.g., cleaner, photographer, creator...)"
              type="search"
            />
          </label>
          <button className="flex h-12 items-center justify-between rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <Icon name="map-pin" className="h-4 w-4 text-slate-400" />
              {cityName}, IL
            </span>
            <Icon name="chevron-down" className="h-4 w-4 text-slate-400" />
          </button>
          <button className="h-12 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700">
            Search
          </button>
        </div>
      </div>

      <div className="relative hidden min-h-[360px] lg:block">
        <FloatingAvatar
          alt="Local barber"
          className="left-4 top-14"
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=180&q=80"
        />
        <FloatingAvatar
          alt="Local coach"
          className="right-6 top-12"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80"
        />
        <FloatingAvatar
          alt="Local trainer"
          className="bottom-10 right-16 h-28 w-28"
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=220&q=80"
        />
        <div className="absolute left-1/2 top-0 w-[230px] -translate-x-1/2 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-blue-200/60">
          <div className="rounded-[1.55rem] border border-slate-100 bg-gradient-to-b from-blue-50 to-white p-5">
            <div className="mx-auto mb-5 flex w-max items-center gap-2 font-bold text-blue-700">
              <Icon name="handshake" className="h-4 w-4" />
              GoBookME
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-950">{previewServiceTitle}</p>
              <p className="mt-1 text-xs text-slate-500">with {previewBusinessName}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-700">
                <span className="flex items-center gap-1">
                  <Icon name="clock" className="h-3.5 w-3.5" />
                  {previewServiceDuration}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="credit-card" className="h-3.5 w-3.5" />
                  {previewServicePrice}
                </span>
              </div>
              <Link
                className="mt-5 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
                href={previewHref}>
                {featuredService ? "Book Now" : "Browse Services"}
              </Link>
              {featuredService ? (
                <div className="mt-3 flex items-center justify-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Icon name="circle-check" className="h-3.5 w-3.5" />
                  Instant Confirmation
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <FloatingIcon className="bottom-20 left-8" icon="calendar-check-2" />
        <FloatingIcon className="right-8 top-40" icon="sparkles" />
        <FloatingIcon className="bottom-5 left-32" icon="credit-card" />
      </div>
    </section>
  );
}

export function CategoryFilter({
  activeSlug = "all",
  citySlug = "champaign",
}: {
  activeSlug?: string;
  citySlug?: string;
}) {
  const basePath = `/${citySlug}`;

  return (
    <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 pb-8 sm:px-6 lg:px-8">
      {categoryFilters.map((category) => {
        const active = category.slug === activeSlug || (activeSlug === "all" && category.slug === "all");
        return (
          <Link
            key={category.slug}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
            }`}
            href={
              category.slug === "all" || category.slug === "more" ? basePath : `${basePath}/${category.slug}`
            }>
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}

export function FeaturedBusinessGrid({
  cityName = "Champaign",
  listings,
}: {
  cityName?: string;
  listings: BusinessListingDTO[];
}) {
  const listingCards = listings.map((listing) => {
    const categories = getListingCategories(listing);
    const displayServices = getDisplayServices(listing);
    const service = displayServices[0];

    return {
      slug: listing.slug,
      name: getBusinessDisplayName(listing),
      category: categories[0]?.name ?? "Local Service",
      reviewLabel: "New on GoBookME",
      startingPrice: service?.price ?? "Pending",
      tags: displayServices.slice(0, 2).map((service) => service.title),
      image: listing.photos[0] ?? null,
      href: `/business/${listing.slug}`,
    };
  });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-950">Featured businesses in {cityName}</h2>
        <Link className="text-sm font-semibold text-blue-700" href={`/${slugifyCityName(cityName)}`}>
          View all
        </Link>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {listingCards.slice(0, 4).map((business) => (
          <article
            key={business.slug}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100">
            <div className="flex gap-4">
              <BusinessImage business={business} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-950">{business.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{business.category}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                  <span className="font-semibold text-emerald-700">{business.reviewLabel}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-900">From {business.startingPrice}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(business.tags.length > 0 ? business.tags : ["Services pending"]).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
            <Link
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700"
              href={business.href}>
              View services
              <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
          </article>
        ))}
        {listingCards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 md:col-span-2 xl:col-span-4">
            No approved {cityName} businesses are live yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function TrustSignalGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-4">
        {trustSignals.map((signal) => (
          <div key={signal.title} className="flex gap-4 border-slate-200 p-5 md:border-r md:last:border-r-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon name={signal.icon} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-950">{signal.title}</p>
              <p className="mt-1 text-xs text-slate-500">{signal.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CityDirectoryPageView({
  activeCategory,
  activeCategorySlug = "all",
  cityName,
  citySlug,
  listings,
}: {
  activeCategory?: { name: string; description?: string | null } | null;
  activeCategorySlug?: string;
  cityName: string;
  citySlug: string;
  listings: BusinessListingDTO[];
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white text-slate-950">
      <GoBookMeHeader locationLabel={`${cityName}, IL`} />
      {activeCategory ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
            href={`/${citySlug}`}>
            Back to {cityName}
          </Link>
          <div className="mt-5 max-w-3xl">
            <p className="text-sm font-semibold text-blue-700">
              {cityName} / {activeCategory.name}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
              Book {activeCategory.name.toLowerCase()} in {cityName}
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {activeCategory.description ||
                "Compare trusted local providers, review service options, and book online with instant confirmation."}
            </p>
          </div>
        </section>
      ) : (
        <MarketplaceHero
          cityName={cityName}
          featuredListing={listings.find((listing) => getDisplayServices(listing).length > 0) ?? null}
        />
      )}
      <CategoryFilter activeSlug={activeCategorySlug} citySlug={citySlug} />
      <FeaturedBusinessGrid cityName={cityName} listings={listings} />
      <TrustSignalGrid />
    </main>
  );
}

export function BusinessProfilePageView({
  canEditListing = false,
  listing,
}: {
  canEditListing?: boolean;
  listing: BusinessListingDTO;
}) {
  const services = getDisplayServices(listing);
  const businessHours = getBusinessHours(listing);
  const citySlug = listing.city || "champaign";
  const cityName = formatCityName(citySlug);
  const manageHref = `/business/manage?edit=${listing.id}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white text-slate-950">
      <GoBookMeHeader
        compact
        ctaHref={canEditListing ? manageHref : "/business/manage"}
        ctaLabel={canEditListing ? "Edit Listing" : "List Your Business"}
        ctaShortLabel={canEditListing ? "Edit" : "List"}
        locationLabel={`${cityName}, IL`}
        showSearch={false}
      />
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500"
          href={`/${citySlug}`}>
          <Icon name="arrow-left" className="h-4 w-4" />
          Back to results
        </Link>

        <BusinessProfileHero
          canEditListing={canEditListing}
          listing={listing}
          manageHref={manageHref}
          services={services}
          openStatus={businessHours.openStatus}
        />
        <BusinessTabs />

        <div className="grid gap-6 pt-5 lg:grid-cols-[1fr_300px]">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <BusinessInfoCard listing={listing} />
            <ServicesCard services={services} />
          </div>
          <aside className="space-y-5">
            <MapPreviewCard listing={listing} />
            <BusinessHoursCard rows={businessHours.rows} />
          </aside>
        </div>
      </section>
    </main>
  );
}

export function BusinessProfileHero({
  canEditListing = false,
  listing,
  manageHref,
  openStatus,
  services,
}: {
  canEditListing?: boolean;
  listing: BusinessListingDTO;
  manageHref?: string;
  openStatus: string;
  services: DisplayService[];
}) {
  const categories = getListingCategories(listing);
  const categoryLabel = categories.map((category) => category.name).join(" & ") || "Local Service";
  const trustBadges = getBusinessProfileBadges(services);
  const productStatus = getBusinessListingProductStatus(listing);
  const statusLabel = productStatus === "live" ? "Verified Business" : getBusinessListingStatusLabel(productStatus);
  const statusClassName =
    productStatus === "live"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-amber-50 text-amber-700";

  return (
    <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-5">
          <BusinessLogo image={listing.photos[0]} large name={getBusinessDisplayName(listing)} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-normal text-slate-950">
                {getBusinessDisplayName(listing)}
              </h1>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName}`}>
                <Icon name={productStatus === "live" ? "badge-check" : "clock"} className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">{categoryLabel}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="font-semibold text-emerald-700">New on GoBookME</span>
              <span className="font-semibold text-emerald-700">{openStatus}</span>
            </div>
            {trustBadges.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {trustBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Icon name="circle-check" className="h-3.5 w-3.5" />
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:min-w-64">
          <div className="flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              <Icon name="share-2" className="h-4 w-4" />
              Share
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              <Icon name="bookmark" className="h-4 w-4" />
              Save
            </button>
          </div>
          {canEditListing ? (
            <div className="grid gap-2">
              <Link
                className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                href={manageHref ?? "/business/manage"}>
                Edit Listing
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                  href="/event-types">
                  Services
                </Link>
                <Link
                  className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                  href="/apps/installation/accounts?slug=stripe">
                  Payments
                </Link>
              </div>
            </div>
          ) : services[0]?.bookingHref ? (
            <Link
              className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              href={services[0].bookingHref}>
              Book Now
            </Link>
          ) : (
            <span className="rounded-xl bg-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-500">
              Booking unavailable
            </span>
          )}
          <p className="text-center text-sm font-medium text-slate-600">
            {services[0] ? `From ${services[0].price}` : "Prices shown on service pages"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function BusinessTabs() {
  return (
    <nav className="mt-5 flex gap-7 border-b border-slate-200 text-sm font-semibold text-slate-500">
      {["Overview", "Services", "Reviews", "About"].map((tab, index) => (
        <a
          key={tab}
          className={`border-b-2 px-1 pb-3 ${index === 0 ? "border-blue-600 text-blue-700" : "border-transparent"}`}
          href={index === 1 ? "#services" : "#overview"}>
          {tab}
        </a>
      ))}
    </nav>
  );
}

export function BusinessInfoCard({ listing }: { listing: BusinessListingDTO }) {
  const contactRows = [
    listing.address ? { icon: "map-pin" as const, label: listing.address } : null,
    listing.phone ? { icon: "phone" as const, label: listing.phone } : null,
    listing.website ? { icon: "globe" as const, label: listing.website } : null,
    listing.instagram ? { icon: "at-sign" as const, label: listing.instagram } : null,
  ].filter((row): row is { icon: "map-pin" | "phone" | "globe" | "at-sign"; label: string } => !!row);

  return (
    <section id="overview" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-950">About {getBusinessDisplayName(listing)}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        {listing.description || "This business has not added a description yet."}
      </p>
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm text-slate-700">
        {contactRows.length ? (
          contactRows.map((row) => (
            <InfoRow key={`${row.icon}-${row.label}`} icon={row.icon} label={row.label} />
          ))
        ) : (
          <p className="text-sm text-slate-500">Contact details have not been added yet.</p>
        )}
      </div>
    </section>
  );
}

export function ServicesCard({ services }: { services: DisplayService[] }) {
  return (
    <section id="services" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-950">Services</h2>
        <a className="text-sm font-semibold text-blue-700" href="#services">
          View all services
        </a>
      </div>
      <div className="divide-y divide-slate-100">
        {services.length > 0 ? (
          services.map((service) => (
            <article key={service.title} className="grid gap-4 py-4 first:pt-0 sm:grid-cols-[1fr_82px]">
              <div>
                <h3 className="font-semibold text-slate-950">{service.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                <div className="mt-2 flex gap-4 text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1">
                    <Icon name="clock" className="h-3.5 w-3.5" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="credit-card" className="h-3.5 w-3.5" />
                    {service.price}
                  </span>
                </div>
              </div>
              <Link
                className="self-center rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                href={service.bookingHref}>
                Book
              </Link>
            </article>
          ))
        ) : (
          <div className="py-5 text-sm leading-6 text-slate-500">
            Bookable services are being set up. Please check back soon.
          </div>
        )}
      </div>
    </section>
  );
}

export function MapPreviewCard({ listing }: { listing: BusinessListingDTO }) {
  const mapQuery =
    listing.latitude && listing.longitude
      ? `${listing.latitude},${listing.longitude}`
      : listing.address
        ? listing.address
        : null;
  const mapUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`
    : null;
  const mapLink = mapQuery ? `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}` : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 bg-blue-50">
        {mapUrl ? (
          <>
            <iframe
              className="h-full w-full border-0 opacity-80"
              loading="lazy"
              src={mapUrl}
              title={`${getBusinessDisplayName(listing)} map preview`}
            />
            <a
              className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-lg"
              href={mapLink ?? undefined}
              rel="noreferrer"
              target="_blank">
              <Icon name="map-pin" className="h-4 w-4" />
              View on map
            </a>
          </>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-slate-500">
            Location has not been added yet.
          </div>
        )}
      </div>
    </section>
  );
}

export function BusinessHoursCard({ rows }: { rows: BusinessHoursRow[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-slate-950">Business Hours</h2>
      <div className="mt-4 space-y-3 text-sm">
        {rows.map((row) => (
          <HoursRow key={row.day} day={row.day} value={row.value} />
        ))}
      </div>
    </section>
  );
}

export function DashboardSidebar({ activeItem = "Manage Listing" }: { activeItem?: string } = {}) {
  const items = [
    { label: "Dashboard", href: "/business/manage", icon: "layout-dashboard" as const },
    { label: "Manage Listing", href: "/business/manage", icon: "badge-check" as const },
    { label: "Team", href: "/business/team", icon: "users" as const },
    { label: "Services", href: "/event-types", icon: "calendar" as const },
    { label: "Bookings", href: "/bookings/upcoming", icon: "calendar-days" as const },
    { label: "Payments", href: "/apps/installation/accounts?slug=stripe", icon: "credit-card" as const },
    { label: "Reviews", href: "/business/manage", icon: "star" as const },
    { label: "Insights", href: "/business/manage", icon: "chart-line" as const },
    { label: "Settings", href: "/settings/my-account/profile", icon: "settings" as const },
  ];

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <Link className="mb-8 flex items-center gap-2 font-bold text-blue-700" href="/champaign">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Icon name="handshake" className="h-4 w-4" />
        </span>
        GoBookME
      </Link>
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Business</p>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              item.label === activeItem
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            }`}
            href={item.href}>
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        className="mt-20 flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600"
        href="/auth/logout">
        <Icon name="log-out" className="h-4 w-4" />
        Logout
      </Link>
    </aside>
  );
}

type DisplayService = {
  title: string;
  description: string;
  duration: string;
  price: string;
  bookingHref: string;
};

type BusinessHoursRow = {
  day: string;
  value: string;
};

type AvailabilityRange = {
  start: number;
  end: number;
};

function getDisplayServices(listing: BusinessListingDTO): DisplayService[] {
  if (listing.services.length === 0) {
    return [];
  }

  return listing.services.flatMap((service) => {
    const bookingPath = getServiceBookingPath(service);
    if (!bookingPath) return [];

    const price = getServicePrice(service.eventType);
    return [{
      title: service.eventType.title,
      description: service.eventType.description || "Book this service online with instant confirmation.",
      duration: `${service.eventType.length} min`,
      price: formatPrice(price.amount, price.currency),
      bookingHref: `/business/${listing.slug}/book/${service.eventType.id}`,
    }];
  });
}

function getBusinessProfileBadges(services: DisplayService[]) {
  const badges: string[] = [];
  if (services.some((service) => service.bookingHref)) {
    badges.push("Online Booking", "Instant Confirmation");
  }
  if (services.some((service) => service.price !== "Free" && service.bookingHref)) {
    badges.push("Secure Payments");
  }
  return badges;
}

function getBusinessDisplayName(listing: Pick<BusinessListingDTO, "displayName" | "slug">) {
  return listing.displayName;
}

function getServicePrice(eventType: BusinessListingDTO["services"][number]["eventType"]) {
  const metadataPrice = getMetadataPaymentPrice(eventType.metadata);
  if (metadataPrice) return metadataPrice;

  return {
    amount: eventType.price,
    currency: eventType.currency,
  };
}

function getMetadataPaymentPrice(metadata: unknown) {
  if (!isRecord(metadata) || !isRecord(metadata.apps)) return null;

  for (const appData of Object.values(metadata.apps)) {
    if (!isRecord(appData)) continue;
    if (appData.enabled !== true) continue;
    if (typeof appData.price !== "number") continue;

    return {
      amount: appData.price,
      currency: typeof appData.currency === "string" ? appData.currency : "usd",
    };
  }

  return null;
}

function formatPrice(price: number, currency = "usd") {
  if (!price) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(price / 100);
}

function getBusinessHours(listing: BusinessListingDTO) {
  const dayRanges = getAvailabilityByDay(listing);
  if (dayRanges.size === 0) {
    return {
      openStatus: "Availability shown during booking",
      rows: [{ day: "Availability", value: "Shown during booking" }],
    };
  }

  const rows = groupBusinessHoursRows(dayRanges);
  const todayRange = dayRanges.get(new Date().getDay());

  return {
    openStatus: todayRange ? `Open today ${formatMinutesRange(todayRange)}` : "Closed today",
    rows,
  };
}

function getAvailabilityByDay(listing: BusinessListingDTO) {
  const dayRanges = new Map<number, AvailabilityRange>();

  for (const service of listing.services) {
    const availability = getServiceAvailability(service);

    for (const item of availability) {
      if (item.date) continue;

      const start = timeToMinutes(item.startTime);
      const end = timeToMinutes(item.endTime);
      for (const day of item.days) {
        const current = dayRanges.get(day);
        dayRanges.set(day, {
          start: current ? Math.min(current.start, start) : start,
          end: current ? Math.max(current.end, end) : end,
        });
      }
    }
  }

  return dayRanges;
}

function getServiceAvailability(service: BusinessListingDTO["services"][number]) {
  if (service.eventType.schedule?.availability.length) {
    return service.eventType.schedule.availability;
  }

  if (service.eventType.availability.length) {
    return service.eventType.availability;
  }

  const defaultSchedule = service.eventType.owner?.schedules.find(
    (schedule) => schedule.id === service.eventType.owner?.defaultScheduleId
  );

  return defaultSchedule?.availability ?? [];
}

function groupBusinessHoursRows(dayRanges: Map<number, AvailabilityRange>) {
  const orderedDays = [1, 2, 3, 4, 5, 6, 0];
  const rows: BusinessHoursRow[] = [];
  let groupStart = orderedDays[0];
  let previousDay = orderedDays[0];
  let previousValue = formatDayAvailability(dayRanges.get(previousDay));

  for (const day of orderedDays.slice(1)) {
    const value = formatDayAvailability(dayRanges.get(day));
    if (value === previousValue) {
      previousDay = day;
      continue;
    }

    rows.push({ day: formatDayRange(groupStart, previousDay), value: previousValue });
    groupStart = day;
    previousDay = day;
    previousValue = value;
  }

  rows.push({ day: formatDayRange(groupStart, previousDay), value: previousValue });
  return rows;
}

function formatDayAvailability(range?: AvailabilityRange) {
  if (!range) return "Closed";
  return formatMinutesRange(range);
}

function formatMinutesRange(range: AvailabilityRange) {
  return `${formatMinutes(range.start)} - ${formatMinutes(range.end)}`;
}

function formatMinutes(minutes: number) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function timeToMinutes(time: Date) {
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}

function formatDayRange(startDay: number, endDay: number) {
  if (startDay === endDay) return dayLabel(startDay);
  return `${dayLabel(startDay)} - ${dayLabel(endDay)}`;
}

function dayLabel(day: number) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day] ?? "Day";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function BusinessImage({ business }: { business: { name: string; image: string | null; slug: string } }) {
  return <BusinessLogo image={business.image} name={business.name} />;
}

function BusinessLogo({
  image,
  large = false,
  name,
}: {
  image?: string | null;
  large?: boolean;
  name: string;
}) {
  if (image) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
          large ? "h-28 w-28" : "h-24 w-24"
        }`}>
        <img alt={name} className="h-full w-full object-cover" src={image} />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm ${
        large ? "h-28 w-28" : "h-24 w-24"
      }`}>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400 text-2xl font-black text-white">
        {getInitials(name)}
      </div>
    </div>
  );
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

export function formatCityName(citySlug: string) {
  return citySlug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function slugifyCityName(cityName: string) {
  return (
    cityName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "champaign"
  );
}

function FloatingAvatar({ alt, className, src }: { alt: string; className: string; src: string }) {
  return (
    <div
      className={`absolute h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-xl ${className}`}>
      <img alt={alt} className="h-full w-full object-cover" src={src} />
    </div>
  );
}

function FloatingIcon({
  className,
  icon,
}: {
  className: string;
  icon: "calendar-check-2" | "sparkles" | "credit-card";
}) {
  return (
    <span
      className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-xl ${className}`}>
      <Icon name={icon} className="h-5 w-5" />
    </span>
  );
}

function InfoRow({ icon, label }: { icon: "map-pin" | "phone" | "globe" | "at-sign"; label: string }) {
  return (
    <p className="flex items-center gap-3">
      <Icon name={icon} className="h-4 w-4 text-slate-400" />
      <span>{label}</span>
    </p>
  );
}

function HoursRow({ day, value }: { day: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-slate-600">
      <span>{day}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
