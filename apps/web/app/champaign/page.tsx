import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import Link from "next/link";
import { ThemeProvider } from "~/theme/ThemeProvider";
import { ThemeToggle } from "~/theme/ThemeToggle";
import { BusinessListingCard } from "~/business/components/BusinessListingCard";

export const metadata = {
  title: "Book local services in Champaign | GoBookMe",
  description: "Browse Champaign service businesses and book online.",
};

export default async function ChampaignDirectoryPage() {
  const service = new BusinessListingService(prisma);
  const [listings, categories] = await Promise.all([
    service.listApprovedListings({ city: "champaign" }),
    service.listCategories(),
  ]);

  return (
    <ThemeProvider>
      <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Hero */}
        <section
          className="relative border-b border-zinc-200 px-6 py-24 dark:border-zinc-800"
          style={{
            backgroundImage:
              "radial-gradient(circle, light-dark(#e4e4e7, #27272a) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}>
          {/* Theme toggle — top right */}
          <div className="absolute right-6 top-6">
            <ThemeToggle />
          </div>

          <div className="relative mx-auto max-w-4xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-3 py-1 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                gobookme.com/champaign
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              Champaign local services,{" "}
              <span className="text-orange-500 dark:text-orange-400">bookable online</span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-zinc-600 dark:text-zinc-400">
              Browse Champaign-area service businesses, compare options, and schedule without a phone call.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-400"
                href="/business/submit">
                List your business
              </Link>
              <Link
                className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
                href="#directory">
                Browse directory ↓
              </Link>
            </div>
          </div>
        </section>

        {/* Category filter */}
        <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Business categories" className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-xs text-zinc-400 dark:text-zinc-600">filter:</span>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                  href={`/champaign/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Listings */}
        <section id="directory" className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-6 font-mono text-xs text-zinc-400 dark:text-zinc-600">
            {listings.length} result{listings.length !== 1 ? "s" : ""} found in Champaign
          </p>
          <div className="grid gap-3">
            {listings.length > 0 ? (
              listings.map((listing) => <BusinessListingCard key={listing.id} dark listing={listing} />)
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="font-mono text-sm text-zinc-500">{"// no approved listings yet"}</p>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                  GoBookMe is onboarding Champaign businesses now — check back soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
