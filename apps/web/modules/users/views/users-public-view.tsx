"use client";

import {
  sdkActionManager,
  useEmbedNonStylesConfig,
  useEmbedStyles,
  useIsEmbed,
} from "@calcom/embed-core/embed-iframe";
import { useRouterQuery } from "@calcom/lib/hooks/useRouterQuery";
import useTheme from "@calcom/lib/hooks/useTheme";
import { UserAvatar } from "@calcom/ui/components/avatar";
import { Icon } from "@calcom/ui/components/icon";
import { OrgBanner } from "@calcom/ui/components/organization-banner";
import { UnpublishedEntity } from "@calcom/ui/components/unpublished-entity";
import { EventTypeDescriptionLazy as EventTypeDescription } from "@calcom/web/modules/event-types/components";
import EmptyPage from "@calcom/web/modules/event-types/components/EmptyPage";
import type { getServerSideProps } from "@server/lib/[user]/getServerSideProps";
import classNames from "classnames";
import type { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { Toaster } from "sonner";
import { GBM_DARK_TOKENS, GBM_LIGHT_TOKENS } from "~/theme/gbm-tokens";
import { ThemeProvider, useGbmTheme } from "~/theme/ThemeProvider";
import { ThemeToggle } from "~/theme/ThemeToggle";

export type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

function UserPageContent(props: PageProps) {
  const { users, profile, eventTypes, entity } = props;

  const [user] = users;
  useTheme(profile.theme);

  const isBioEmpty = !user.bio || !user.bio.replace("<p><br></p>", "").length;

  const isEmbed = useIsEmbed(props.isEmbed);
  const eventTypeListItemEmbedStyles = useEmbedStyles("eventTypeListItem");
  const shouldAlignCentrallyInEmbed = useEmbedNonStylesConfig("align") !== "left";
  const shouldAlignCentrally = !isEmbed || shouldAlignCentrallyInEmbed;
  const { user: _user, orgSlug: _orgSlug, redirect: _redirect, ...query } = useRouterQuery();
  const { isDark } = useGbmTheme();

  if (entity.considerUnpublished) {
    return (
      <div className="flex h-full min-h-[calc(100dvh)] items-center justify-center">
        <UnpublishedEntity {...entity} />
      </div>
    );
  }

  const isEventListEmpty = eventTypes.length === 0;
  const isOrg = !!user?.profile?.organization;

  return (
    <div
      className="min-h-[calc(100dvh)] bg-zinc-50 dark:bg-[#09090b]"
      style={isDark ? GBM_DARK_TOKENS : GBM_LIGHT_TOKENS}>
      {/* Fixed bottom-right avoids the booker's fixed top-right layout toggle */}
      {!isEmbed && <ThemeToggle className="fixed bottom-4 right-4 z-50" />}
      <div className={classNames(shouldAlignCentrally ? "mx-auto" : "", isEmbed ? "max-w-3xl" : "")}>
        <main
          className={classNames(
            shouldAlignCentrally ? "mx-auto" : "",
            isEmbed ? "border-booker border-booker-width bg-default rounded-md" : "",
            "max-w-2xl px-4 pb-16 pt-8"
          )}>
          {/* Profile card */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {isOrg && user.profile.organization?.bannerUrl && (
              <OrgBanner
                alt={user.profile.organization.name ?? "Organization banner"}
                imageSrc={user.profile.organization.bannerUrl}
                className="w-full border-b border-zinc-200 object-cover dark:border-zinc-800"
              />
            )}
            <div className="p-6">
              <UserAvatar
                size="lg"
                user={{
                  avatarUrl: user.avatarUrl,
                  profile: user.profile,
                  name: profile.name,
                  username: profile.username,
                }}
                className={isOrg && user.profile.organization?.bannerUrl ? "-mt-14" : ""}
              />
              <div className="mt-4 space-y-1">
                <h1
                  className="font-cal text-xl font-semibold text-zinc-900 dark:text-zinc-50"
                  data-testid="name-title">
                  {profile.name}
                  {!isOrg && user.verified && (
                    <Icon name="badge-check" className="mx-1 -mt-1 inline h-5 w-5 fill-blue-500 text-white" />
                  )}
                  {isOrg && (
                    <Icon
                      name="badge-check"
                      className="mx-1 -mt-1 inline h-5 w-5 fill-yellow-500 text-white"
                    />
                  )}
                </h1>
                {!isBioEmpty && (
                  <div
                    className="text-sm text-zinc-600 dark:text-zinc-400 [&_a]:text-orange-500 [&_a]:underline [&_a]:hover:text-orange-400 dark:[&_a]:text-orange-400 dark:[&_a]:hover:text-orange-300"
                    /* biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via safeBio */
                    dangerouslySetInnerHTML={{ __html: props.safeBio }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Event type list */}
          <div className="space-y-2" data-testid="event-types">
            {!isEventListEmpty && (
              <p className="mb-3 font-mono text-xs text-zinc-500 dark:text-zinc-600">
                {eventTypes.length} service{eventTypes.length !== 1 ? "s" : ""} available
              </p>
            )}
            {eventTypes.map((type) => (
              <Link
                key={type.id}
                style={{ display: "flex", ...eventTypeListItemEmbedStyles }}
                prefetch={false}
                href={{
                  pathname: `/${user.profile.username}/${type.slug}`,
                  query,
                }}
                passHref
                onClick={async () => {
                  sdkActionManager?.fire("eventTypeSelected", { eventType: type });
                }}
                className="group flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                data-testid="event-type-link">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-zinc-800 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-white">
                    {type.title}
                  </h2>
                  <EventTypeDescription eventType={type} isPublic={true} shortenDescription />
                </div>
                <Icon
                  name="arrow-right"
                  className="ml-4 h-4 w-4 shrink-0 text-zinc-400 transition-colors group-hover:text-orange-500 dark:text-zinc-600 dark:group-hover:text-orange-400"
                />
              </Link>
            ))}
          </div>

          {isEventListEmpty && <EmptyPage name={profile.name || "User"} />}
        </main>
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

export function UserPage(props: PageProps) {
  return (
    <ThemeProvider>
      <UserPageContent {...props} />
    </ThemeProvider>
  );
}

export default UserPage;
