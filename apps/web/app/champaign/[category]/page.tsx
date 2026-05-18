import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import { notFound } from "next/navigation";
import { CityDirectoryPageView } from "~/business/components/GoBookMeMarketplace";

type CategoryDirectoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: CategoryDirectoryPageProps) {
  const { category } = await params;
  return {
    title: `Book ${category.replaceAll("-", " ")} in Champaign | GoBookME`,
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
    <CityDirectoryPageView
      activeCategory={activeCategory}
      activeCategorySlug={category}
      cityName="Champaign"
      citySlug="champaign"
      listings={listings}
    />
  );
}
