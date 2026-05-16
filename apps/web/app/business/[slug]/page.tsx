import process from "node:process";
import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import { BusinessListingAnalyticsEvent } from "@calcom/prisma/enums";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createBusinessClaimRequestAction } from "~/business/actions";
import { GoogleMap } from "~/business/components/GoogleMap";
import { getListingCategories, getServiceBookingPath, isClaimable } from "~/business/lib/listing-view-model";
import { ThemeProvider } from "~/theme/ThemeProvider";
import { ThemeToggle } from "~/theme/ThemeToggle";

type BusinessProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string; claim?: string }>;
};

export async function generateMetadata({ params }: BusinessProfilePageProps) {
  const { slug } = await params;
  const service = new BusinessListingService(prisma);
  const listing = await service.getApprovedListing(slug);

  if (!listing) return {};
  return {
    title: `${listing.displayName} | GoBookMe`,
    description: listing.description ?? `Book ${listing.displayName} online with GoBookMe.`,
  };
}

export default async function BusinessProfilePage({ params, searchParams }: BusinessProfilePageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const service = new BusinessListingService(prisma);
  const listing = await service.getApprovedListing(slug);

  if (!listing) notFound();

  if (resolvedSearchParams.source === "qr") {
    await service.trackAnalytics({
      listingId: listing.id,
      event: BusinessListingAnalyticsEvent.QR_VISIT,
      source: "qr",
    });
  }

  const categories = getListingCategories(listing);
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const claimRequestAction = createBusinessClaimRequestAction as unknown as string;
  const coverPhoto = listing.photos[0];

  return (
    <ThemeProvider>
      <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Sticky top nav */}
        <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-950/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
              href="/business">
              ← business directory
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Cover image */}
        {coverPhoto ? (
          <div className="relative h-56 overflow-hidden sm:h-72">
            <img alt="" className="h-full w-full object-cover opacity-60" src={coverPhoto} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950" />
          </div>
        ) : (
          <div className="h-24 bg-zinc-50 dark:bg-zinc-900" />
        )}

        {/* Identity */}
        <section className="border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="mx-auto max-w-6xl px-6 pb-8 pt-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600"
                    href={`/champaign/${category.slug}`}>
                    {category.name}
                  </Link>
                ))}
                {listing.featured ? (
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
                    Featured
                  </span>
                ) : null}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                {listing.displayName}
              </h1>
              {(listing.neighborhood ?? listing.city) ? (
                <p className="text-sm text-zinc-500">
                  {[listing.neighborhood, listing.city].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              {listing.description ? (
                <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{listing.description}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
          {/* Services */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Services</h2>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                {listing.services.length} available
              </span>
            </div>

            {listing.services.length > 0 ? (
              <div className="grid gap-3">
                {listing.services.map((serviceItem) => {
                  const bookingPath = getServiceBookingPath(serviceItem);
                  return (
                    <article
                      key={serviceItem.id}
                      className="group rounded-xl border border-zinc-100 bg-white p-5 transition-colors hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">
                            {serviceItem.eventType.title}
                          </h3>
                          <p className="text-xs text-zinc-400 dark:text-zinc-600">
                            {serviceItem.eventType.length} min
                          </p>
                        </div>
                        {bookingPath ? (
                          <Link
                            className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                            href={`/business/${listing.slug}/book/${serviceItem.eventType.id}`}>
                            Book now →
                          </Link>
                        ) : (
                          <span className="shrink-0 rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500">No services published yet.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Location */}
            <div className="space-y-4 rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Location
              </h2>
              {listing.address ? (
                <p className="text-sm text-zinc-700 dark:text-zinc-300">{listing.address}</p>
              ) : null}
              <GoogleMap
                apiKey={googleMapsApiKey}
                label={listing.displayName}
                latitude={listing.latitude}
                longitude={listing.longitude}
              />
            </div>

            {/* Contact */}
            {(listing.phone ?? listing.website ?? listing.instagram) ? (
              <div className="space-y-3 rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Contact
                </h2>
                {listing.phone ? (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{listing.phone}</p>
                ) : null}
                {listing.website ? (
                  <a
                    className="block text-sm text-orange-500 transition-colors hover:text-orange-400 dark:text-orange-400 dark:hover:text-orange-300"
                    href={listing.website}
                    rel="noreferrer"
                    target="_blank">
                    {listing.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                ) : null}
                {listing.instagram ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{listing.instagram}</p>
                ) : null}
              </div>
            ) : null}

            {/* Claim */}
            {isClaimable(listing) ? (
              <div className="space-y-4 rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                  Own this business?
                </h2>
                {resolvedSearchParams.claim === "requested" ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Your claim request has been sent for review.
                  </p>
                ) : (
                  <form action={claimRequestAction} className="space-y-3">
                    <input name="listingId" type="hidden" value={listing.id} />
                    <input name="slug" type="hidden" value={listing.slug} />
                    <input
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-500"
                      name="requesterName"
                      placeholder="Your name"
                      required
                    />
                    <input
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-500"
                      name="requesterEmail"
                      placeholder="Email"
                      required
                      type="email"
                    />
                    <textarea
                      className="min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-500"
                      name="message"
                      placeholder="How are you connected to this business?"
                    />
                    <button
                      className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                      type="submit">
                      Request ownership
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </aside>
        </section>
      </main>
    </ThemeProvider>
  );
}
