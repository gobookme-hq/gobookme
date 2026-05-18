import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { slugify } from "@calcom/lib/slugify";
import { prisma } from "@calcom/prisma";
import { formatCityName } from "../components/GoBookMeMarketplace";

export async function getRootCityDirectoryData(citySegment: string | string[] | undefined) {
  const citySlug = slugify(normalizeSegment(citySegment));
  if (!citySlug || citySlug.includes("+")) return null;

  const [user, listings] = await Promise.all([
    prisma.user.findFirst({
      where: { username: citySlug },
      select: { id: true },
    }),
    new BusinessListingService(prisma).listApprovedListings({ city: citySlug }),
  ]);

  if (user || listings.length === 0) return null;

  return {
    cityName: formatCityName(citySlug),
    citySlug,
    listings,
  };
}

export async function getRootCityCategoryDirectoryData({
  categorySegment,
  citySegment,
}: {
  categorySegment: string | string[] | undefined;
  citySegment: string | string[] | undefined;
}) {
  const citySlug = slugify(normalizeSegment(citySegment));
  const categorySlug = slugify(normalizeSegment(categorySegment));
  if (!citySlug || !categorySlug || citySlug.includes("+")) return null;

  const service = new BusinessListingService(prisma);
  const [user, cityListings, listings, categories] = await Promise.all([
    prisma.user.findFirst({
      where: { username: citySlug },
      select: { id: true },
    }),
    service.listApprovedListings({ city: citySlug }),
    service.listApprovedListings({ city: citySlug, categorySlug }),
    service.listCategories(),
  ]);

  if (user || cityListings.length === 0) return null;

  const activeCategory = categories.find((category) => category.slug === categorySlug);
  if (!activeCategory) return null;

  return {
    activeCategory,
    categorySlug,
    cityName: formatCityName(citySlug),
    citySlug,
    listings,
  };
}

function normalizeSegment(segment: string | string[] | undefined) {
  if (Array.isArray(segment)) return segment[0] ?? "";
  return segment ?? "";
}
