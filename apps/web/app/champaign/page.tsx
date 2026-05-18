import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import { CityDirectoryPageView } from "~/business/components/GoBookMeMarketplace";

export const metadata = {
  title: "Book local services in Champaign | GoBookME",
  description: "Browse Champaign service businesses and book online.",
};

export default async function ChampaignDirectoryPage() {
  const service = new BusinessListingService(prisma);
  const listings = await service.listApprovedListings({ city: "champaign" });

  return <CityDirectoryPageView cityName="Champaign" citySlug="champaign" listings={listings} />;
}
