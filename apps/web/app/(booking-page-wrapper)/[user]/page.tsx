import { WEBAPP_URL } from "@calcom/lib/constants";
import { buildLegacyCtx, decodeParams } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@server/lib/[user]/getServerSideProps";
import type { PageProps } from "app/_types";
import { generateMeetingMetadata } from "app/_utils";
import { withAppDirSsr } from "app/WithAppDirSsr";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { CityDirectoryPageView } from "~/business/components/GoBookMeMarketplace";
import { getRootCityDirectoryData } from "~/business/lib/city-directory";
import type { PageProps as LegacyPageProps } from "~/users/views/users-public-view";
import LegacyPage from "~/users/views/users-public-view";

const getData: (ctx: ReturnType<typeof buildLegacyCtx>) => Promise<LegacyPageProps> =
  withAppDirSsr<LegacyPageProps>(getServerSideProps);

const ServerPage = async ({ params, searchParams }: PageProps): Promise<JSX.Element> => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const decodedParams = decodeParams(resolvedParams);
  const cityDirectory = await getRootCityDirectoryData(decodedParams.user);

  if (cityDirectory) {
    return (
      <CityDirectoryPageView
        cityName={cityDirectory.cityName}
        citySlug={cityDirectory.citySlug}
        listings={cityDirectory.listings}
      />
    );
  }

  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), resolvedParams, resolvedSearchParams)
  );

  return <LegacyPage {...props} />;
};

export const generateMetadata = async ({ params, searchParams }: PageProps): Promise<Metadata> => {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const decodedParams = decodeParams(resolvedParams);
  const cityDirectory = await getRootCityDirectoryData(decodedParams.user);

  if (cityDirectory) {
    return {
      title: `Book local services in ${cityDirectory.cityName} | GoBookME`,
      description: `Browse ${cityDirectory.cityName} service businesses and book online.`,
    };
  }

  const props = await getData(
    buildLegacyCtx(await headers(), await cookies(), resolvedParams, resolvedSearchParams)
  );

  const { profile, markdownStrippedBio, isOrgSEOIndexable } = props;
  const isOrg = !!profile?.organization;
  const allowSEOIndexing =
    (!isOrg && profile.allowSEOIndexing) || (isOrg && isOrgSEOIndexable && profile.allowSEOIndexing);

  const meeting = {
    title: markdownStrippedBio,
    profile: { name: `${profile.name}`, image: profile.image },
    users: [{ username: `${profile.username}`, name: `${profile.name}` }],
  };
  const metadata = await generateMeetingMetadata(
    meeting,
    () => profile.name,
    () => markdownStrippedBio,
    false,
    WEBAPP_URL,
    `/${decodedParams.user}`
  );

  return {
    ...metadata,
    robots: {
      follow: allowSEOIndexing,
      index: allowSEOIndexing,
    },
  };
};

export default ServerPage;
