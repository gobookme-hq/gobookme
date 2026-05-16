"use client";

import type { CustomClassNames } from "@calcom/features/bookings/Booker/types";
import { getBookerWrapperClasses } from "@calcom/features/bookings/Booker/utils/getBookerWrapperClasses";
import { BookerWebWrapper as Booker } from "@calcom/web/modules/bookings/components/BookerWebWrapper";
import BookingPageErrorBoundary from "@components/error/BookingPageErrorBoundary";
import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { getServerSideProps } from "@server/lib/[user]/[type]/getServerSideProps";
import type { EmbedProps } from "app/WithEmbedSSR";
import { useSearchParams } from "next/navigation";
import { GBM_DARK_TOKENS, GBM_LIGHT_TOKENS } from "~/theme/gbm-tokens";
import { ThemeProvider, useGbmTheme } from "~/theme/ThemeProvider";
import { ThemeToggle } from "~/theme/ThemeToggle";

export type PageProps = inferSSRProps<typeof getServerSideProps> & EmbedProps;

export const getMultipleDurationValue = (
  multipleDurationConfig: number[] | undefined,
  queryDuration: string | string[] | null | undefined,
  defaultValue: number
) => {
  if (!multipleDurationConfig) return null;
  if (multipleDurationConfig.includes(Number(queryDuration))) return Number(queryDuration);
  return defaultValue;
};

// Tailwind class overrides for monospace typography and rounder date cell shapes.
const GBM_BOOKING_CLASSNAMES: CustomClassNames = {
  datePickerCustomClassNames: {
    datePickerTitle: "!font-mono",
    datePickerDays: "!font-mono !text-[11px] !uppercase !tracking-wider",
    datePickerDatesActive: "!rounded-xl",
    datePickerToggle: "!font-mono",
  },
  eventMetaCustomClassNames: {
    eventMetaTitle: "!font-mono !tracking-tight",
  },
  availableTimeSlotsCustomClassNames: {
    availableTimeSlotsTitle: "!font-mono !text-xs !uppercase !tracking-widest",
    availableTimes: "!font-mono",
  },
};

function TypeContent({ slug, user, isEmbed, booking, isBrandingHidden, eventData, orgBannerUrl }: PageProps) {
  const searchParams = useSearchParams();
  const { isDark } = useGbmTheme();

  return (
    <div
      className="min-h-[calc(100dvh)] bg-zinc-50 dark:bg-[#09090b]"
      style={isDark ? GBM_DARK_TOKENS : GBM_LIGHT_TOKENS}>
      {/* Fixed bottom-right avoids the booker's fixed top-right layout toggle */}
      {!isEmbed && <ThemeToggle className="fixed bottom-4 right-4 z-50" />}
      <BookingPageErrorBoundary>
        <main
          className={
            isEmbed ? getBookerWrapperClasses({ isEmbed: true }) : "flex min-h-[calc(100dvh)] items-center justify-center"
          }>
          <Booker
            username={user}
            eventSlug={slug}
            bookingData={booking}
            hideBranding={isBrandingHidden}
            eventData={eventData}
            entity={{ ...eventData.entity, eventTypeId: eventData?.id }}
            durationConfig={eventData.metadata?.multipleDuration}
            orgBannerUrl={orgBannerUrl}
            customClassNames={GBM_BOOKING_CLASSNAMES}
            duration={getMultipleDurationValue(
              eventData.metadata?.multipleDuration,
              searchParams?.get("duration"),
              eventData.length
            )}
          />
        </main>
      </BookingPageErrorBoundary>
    </div>
  );
}

function Type(props: PageProps) {
  return (
    <ThemeProvider>
      <TypeContent {...props} />
    </ThemeProvider>
  );
}

export default Type;
