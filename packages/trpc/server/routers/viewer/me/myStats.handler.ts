import { UserRepository } from "@calcom/features/users/repositories/UserRepository";
import prisma from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/types";
import type { Session } from "next-auth";

type MyStatsOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    session: Session;
  };
};

export const myStatsHandler = async ({ ctx }: MyStatsOptions) => {
  const { user: sessionUser } = ctx;

  const [additionalUserInfo, calendarCredCount, paymentCredCount, scheduleCount] = await Promise.all([
    new UserRepository(prisma).getUserStats({ userId: sessionUser.id }),
    prisma.credential.count({
      where: { userId: sessionUser.id, type: { endsWith: "_calendar" } },
    }),
    prisma.credential.count({
      where: { userId: sessionUser.id, type: "stripe_payment" },
    }),
    prisma.schedule.count({
      where: { userId: sessionUser.id, availability: { some: {} } },
    }),
  ]);

  const sumOfTeamEventTypes = additionalUserInfo?.teams.reduce(
    (sum, team) => sum + team.team.eventTypes.length,
    0
  );

  return {
    id: sessionUser.id,
    sumOfBookings: additionalUserInfo?._count.bookings,
    sumOfCalendars: additionalUserInfo?._count.userLevelSelectedCalendars,
    sumOfTeams: additionalUserInfo?._count.teams,
    sumOfEventTypes: additionalUserInfo?._count.eventTypes,
    sumOfTeamEventTypes,
    hasCalendar: calendarCredCount > 0,
    hasPayment: paymentCredCount > 0,
    hasAvailability: scheduleCount > 0,
  };
};
