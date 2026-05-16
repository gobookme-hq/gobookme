import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import Link from "next/link";
import { ThemeProvider } from "~/theme/ThemeProvider";
import { ThemeToggle } from "~/theme/ThemeToggle";
import { BusinessListingCard } from "~/business/components/BusinessListingCard";

export const metadata = {
  title: "Find & Book Local Services | GoBookMe",
  description: "Browse verified local businesses and book appointments online.",
};

export default async function BusinessDirectoryPage() {
  const service = new BusinessListingService(prisma);
  const [listings, categories] = await Promise.all([
    service.listApprovedListings({}),
    service.listCategories(),
  ]);

  return (
    <ThemeProvider>
      <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Sticky top nav */}
        <header className="sticky top-0 z-20 border-b border-zinc-100 bg-white/90 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-950/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">gobookme.com/business</span>
            <ThemeToggle />
          </div>
        </header>

        {/* Hero */}
        <section className="border-b border-zinc-100 px-6 py-24 dark:border-zinc-800/60">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              Book local services,{" "}
              <span className="text-orange-500 dark:text-orange-400">instantly</span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-zinc-500 dark:text-zinc-400">
              Browse verified local businesses, compare services, and schedule online — no phone calls, no
              waiting.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
                href="/business/submit">
                List your business
              </Link>
              <Link
                className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-white"
                href="#directory">
                Browse directory ↓
              </Link>
            </div>
          </div>
        </section>

        {/* Category filter */}
        <section className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-3.5 dark:border-zinc-800/60 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Business categories" className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-zinc-400 dark:text-zinc-600">Filter:</span>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                  href={`/champaign/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Listings */}
        <section id="directory" className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-6 text-xs text-zinc-400 dark:text-zinc-600">
            {listings.length} result{listings.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-3">
            {listings.length > 0 ? (
              listings.map((listing) => <BusinessListingCard key={listing.id} listing={listing} />)
            ) : (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500">No approved listings yet.</p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-600">
                  We&apos;re onboarding businesses now — check back soon.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
