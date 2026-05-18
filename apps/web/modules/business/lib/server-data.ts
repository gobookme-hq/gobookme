import { prisma } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";

export async function getAdminEventTypeOptions() {
  return await prisma.eventType.findMany({
    where: {
      hidden: false,
    },
    orderBy: [{ title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });
}

export async function getOwnerEventTypeOptions({
  ownerTeamId,
  ownerUserId,
  userId,
}: {
  ownerTeamId?: number | null;
  ownerUserId?: number | null;
  userId: number;
}) {
  const ownerScope: ({ teamId: number } | { userId: number })[] = [];
  if (ownerTeamId) {
    ownerScope.push({ teamId: ownerTeamId });
  } else if (ownerUserId) {
    ownerScope.push({ userId: ownerUserId });
  }

  return await prisma.eventType.findMany({
    where: {
      hidden: false,
      OR:
        ownerScope.length > 0
          ? ownerScope
          : [
              { userId },
              {
                team: {
                  members: {
                    some: {
                      userId,
                      role: {
                        in: [MembershipRole.OWNER, MembershipRole.ADMIN],
                      },
                    },
                  },
                },
              },
            ],
    },
    orderBy: [{ title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });
}

export async function getAdminOwnerOptions() {
  const [users, teams] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ name: "asc" }, { email: "asc" }],
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.team.findMany({
      orderBy: [{ name: "asc" }],
      take: 100,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ]);

  return { users, teams };
}
