import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { BusinessListingService } from "@calcom/features/business-listings/services/BusinessListingService";
import { prisma } from "@calcom/prisma";
import { BusinessListingAnalyticsEvent } from "@calcom/prisma/enums";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { BusinessProfilePageView } from "~/business/components/GoBookMeMarketplace";

type BusinessProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ source?: string; claim?: string; preview?: string }>;
};

export async function generateMetadata({ params }: BusinessProfilePageProps) {
  const { slug } = await params;
  const service = new BusinessListingService(prisma);
  const listing = await service.getApprovedListing(slug);

  if (!listing) return {};
  const displayName = listing.displayName;
  return {
    title: `${displayName} | GoBookME`,
    description: listing.description ?? `Book ${displayName} online with GoBookME.`,
  };
}

export default async function BusinessProfilePage({ params, searchParams }: BusinessProfilePageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const service = new BusinessListingService(prisma);
  const isPreview = resolvedSearchParams.preview === "1";
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  const listing = isPreview
    ? await service.getPreviewListing({
        isAdmin: session?.user?.role === "ADMIN",
        slug,
        userId: session?.user?.id,
      })
    : await service.getApprovedListing(slug);

  if (!listing) notFound();

  const canEditListing = session?.user?.id
    ? await service.userCanEditListing({ listingId: listing.id, userId: session.user.id })
    : false;

  if (!isPreview && resolvedSearchParams.source === "qr") {
    await service.trackAnalytics({
      listingId: listing.id,
      event: BusinessListingAnalyticsEvent.QR_VISIT,
      source: "qr",
    });
  }

  return <BusinessProfilePageView canEditListing={canEditListing} listing={listing} />;
}
