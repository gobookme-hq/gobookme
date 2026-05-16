import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeProvider } from "~/theme/ThemeProvider";
import { ThemeToggle } from "~/theme/ThemeToggle";
import { BusinessListingCard } from "~/business/components/BusinessListingCard";

type CategoryDirectoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryDirectoryPageProps) {
  const { category } = await params;
  return {
    title: `Book ${category.replaceAll("-", " ")} in Champaign | GoBookMe`,
    description: `Find and book ${category.replaceAll("-", " ")} services in Champaign.`,
  };
}

export default async function CategoryDirectoryPage({ params }: CategoryDirectoryPageProps) {
  const { category } = await params;
  const service = new BusinessListingService(prisma);
  const [listings, categories] = await Promise.all([
    service.listApprovedListings({ city: "champaign", categorySlug: category }),
    service.listCategories(),
  ]);
  const activeCategory = categories.find((item) => item.slug === category);

  if (!activeCategory) notFound();

  return (
    <ThemeProvider>
      <main className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Header */}
        <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-12 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between">
              <Link
                className="font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                href="/champaign">
                ← champaign directory
              </Link>
              <ThemeToggle />
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 dark:border-zinc-700 dark:bg-zinc-900">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  champaign / {activeCategory.slug}
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                {activeCategory.name}
                <span className="text-orange-500 dark:text-orange-400"> in Champaign</span>
              </h1>
              {activeCategory.description ? (
                <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                  {activeCategory.description}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Category nav */}
        <section className="border-b border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="All categories" className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-xs text-zinc-400 dark:text-zinc-600">filter:</span>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
                    cat.slug === category
                      ? "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                  }`}
                  href={`/champaign/${cat.slug}`}>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </section>

        {/* Listings */}
        <section className="mx-auto max-w-6xl px-6 py-10">
          <p className="mb-6 font-mono text-xs text-zinc-400 dark:text-zinc-600">
            {listings.length} result{listings.length !== 1 ? "s" : ""} in{" "}
            <span className="text-zinc-500">{activeCategory.name}</span>
          </p>
          <div className="grid gap-3">
            {listings.length > 0 ? (
              listings.map((listing) => <BusinessListingCard key={listing.id} dark listing={listing} />)
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="font-mono text-sm text-zinc-500">{"// no listings in this category yet"}</p>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-600">
                  No approved businesses are listed here yet.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
