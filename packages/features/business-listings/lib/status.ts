import {
  BusinessListingApprovalStatus,
  BusinessListingClaimStatus,
  BusinessListingVisibility,
} from "@calcom/prisma/enums";

export type BusinessListingProductStatus =
  | "incomplete"
  | "unclaimed"
  | "draft"
  | "pending_review"
  | "changes_requested"
  | "live"
  | "hidden"
  | "rejected";

type ListingStatusInput = {
  approvalStatus: BusinessListingApprovalStatus;
  claimStatus?: BusinessListingClaimStatus;
  ownerTeamId?: number | null;
  ownerUserId?: number | null;
  visibility: BusinessListingVisibility;
  reviewNote?: string | null;
  submittedAt?: Date | string | null;
  profileCompleteness?: number | null;
};

export function getBusinessListingProductStatus(listing: ListingStatusInput): BusinessListingProductStatus {
  if (listing.approvalStatus === BusinessListingApprovalStatus.REJECTED) return "rejected";
  if (
    listing.approvalStatus === BusinessListingApprovalStatus.APPROVED &&
    listing.visibility === BusinessListingVisibility.PUBLIC
  ) {
    return "live";
  }
  if (
    listing.claimStatus === BusinessListingClaimStatus.UNCLAIMED &&
    !listing.ownerUserId &&
    !listing.ownerTeamId
  ) {
    return "unclaimed";
  }
  if ((listing.profileCompleteness ?? 0) < 40) return "incomplete";
  if (
    listing.approvalStatus === BusinessListingApprovalStatus.APPROVED &&
    listing.visibility === BusinessListingVisibility.HIDDEN
  ) {
    return "hidden";
  }
  if (listing.reviewNote) return "changes_requested";
  if (listing.submittedAt) return "pending_review";
  return "draft";
}

export function getBusinessListingStatusLabel(status: BusinessListingProductStatus) {
  switch (status) {
    case "incomplete":
      return "Incomplete";
    case "unclaimed":
      return "Unclaimed";
    case "draft":
      return "Draft";
    case "pending_review":
      return "Pending Review";
    case "changes_requested":
      return "Changes Requested";
    case "live":
      return "Live";
    case "hidden":
      return "Hidden";
    case "rejected":
      return "Rejected";
  }
}

export function getBusinessListingStatusDescription(status: BusinessListingProductStatus) {
  switch (status) {
    case "incomplete":
      return "Complete your profile, services, and contact details before review.";
    case "unclaimed":
      return "This listing exists in the marketplace but has not been attached to a business owner yet.";
    case "draft":
      return "Save your profile and submit it when you are ready for GoBookME review.";
    case "pending_review":
      return "GoBookME is reviewing this listing before it appears publicly.";
    case "changes_requested":
      return "GoBookME requested updates before this listing can go live.";
    case "live":
      return "This listing is approved and visible in the public marketplace.";
    case "hidden":
      return "This listing is approved but hidden from the public marketplace.";
    case "rejected":
      return "This listing was rejected and is not visible publicly.";
  }
}

export function canPreviewBusinessListing(status: BusinessListingProductStatus) {
  return status !== "live";
}

export function calculateBusinessListingCompleteness(input: {
  displayName?: string | null;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  photos?: string[];
  categorySlugs?: string[];
  eventTypeIds?: number[];
}) {
  const checks = [
    !!input.displayName,
    !!input.description,
    !!input.city,
    !!input.address,
    !!input.phone || !!input.website || !!input.instagram,
    (input.photos?.length ?? 0) > 0,
    (input.categorySlugs?.length ?? 0) > 0,
    (input.eventTypeIds?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function getBusinessListingChecklist(input: {
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  photos?: string[];
  categories?: unknown[];
  services?: unknown[];
}) {
  return [
    { label: "Business description", complete: !!input.description },
    { label: "Category", complete: (input.categories?.length ?? 0) > 0 },
    { label: "Bookable service", complete: (input.services?.length ?? 0) > 0 },
    { label: "Address or map location", complete: !!input.address },
    {
      label: "Contact method",
      complete: !!input.phone || !!input.website || !!input.instagram,
    },
    { label: "Logo or image", complete: (input.photos?.length ?? 0) > 0 },
  ];
}
