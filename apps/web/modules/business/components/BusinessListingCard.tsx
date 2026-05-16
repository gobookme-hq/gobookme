import type { BusinessListingDTO } from "@calcom/features/business-listings/repositories/BusinessListingRepository";
import Link from "next/link";
import { getListingCategories } from "../lib/listing-view-model";

export function BusinessListingCard({
  listing,
  dark = false,
}: {
  listing: BusinessListingDTO;
  dark?: boolean;
}) {
  const categories = getListingCategories(listing);
  const photo = listing.photos[0];
  const cardClassName = dark
    ? "group grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-zinc-700 sm:grid-cols-[160px_1fr]"
    : "group grid gap-4 rounded-xl border border-zinc-100 bg-white p-5 transition-colors hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 sm:grid-cols-[160px_1fr]";

  return (
    <article className={cardClassName}>
      <div className="aspect-[4/3] shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        {photo ? (
          <img alt="" className="h-full w-full object-cover" src={photo} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400 dark:text-zinc-600">
            No photo
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-900 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-white">
            {listing.displayName}
          </h2>
          {listing.featured ? (
            <span className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400">
              Featured
            </span>
          ) : null}
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          {[listing.neighborhood, listing.city].filter(Boolean).join(" · ")}
        </p>
        {listing.description ? (
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{listing.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <span
              key={category.slug}
              className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              {category.name}
            </span>
          ))}
        </div>
        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 transition-colors hover:text-orange-400 dark:text-orange-400 dark:hover:text-orange-300"
          href={`/business/${listing.slug}`}>
          View services →
        </Link>
      </div>
    </article>
  );
}
