"use server";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { prisma } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

function readString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readNumber(value: FormDataEntryValue | null) {
  const stringValue = readString(value);
  if (!stringValue) return null;
  const parsed = Number(stringValue);
  return Number.isInteger(parsed) ? parsed : null;
}

function readRole(value: FormDataEntryValue | null) {
  return value === MembershipRole.ADMIN ? MembershipRole.ADMIN : MembershipRole.MEMBER;
}

async function getRequiredSession() {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");
  return session;
}

async function requireTeamAdmin(teamId: number, userId: number) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
    select: {
      role: true,
      accepted: true,
    },
  });

  if (
    !membership?.accepted ||
    (membership.role !== MembershipRole.OWNER && membership.role !== MembershipRole.ADMIN)
  ) {
    redirect("/business/team?error=not-authorized");
  }
}

export async function createBusinessTeamAction(formData: FormData) {
  const session = await getRequiredSession();
  const requestedName = readString(formData.get("name"));

  const ownerListing = await prisma.businessListing.findFirst({
    where: {
      ownerUserId: session.user.id,
    },
    select: {
      id: true,
      displayName: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const teamName = requestedName ?? ownerListing?.displayName ?? "My business team";
  const slugBase = teamName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
  const slug = `${slugBase}-${session.user.id}-${Date.now()}`;

  const team = await prisma.team.create({
    data: {
      name: teamName,
      slug,
      members: {
        create: {
          accepted: true,
          role: MembershipRole.OWNER,
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  if (ownerListing) {
    await prisma.businessListing.update({
      where: {
        id: ownerListing.id,
      },
      data: {
        ownerTeamId: team.id,
      },
      select: {
        id: true,
      },
    });
  }

  revalidatePath("/business/team");
  revalidatePath("/business/manage");
  redirect(`/business/team?teamId=${team.id}`);
}

export async function addBusinessTeamMemberAction(formData: FormData) {
  const session = await getRequiredSession();
  const teamId = readNumber(formData.get("teamId"));
  const email = readString(formData.get("email"))?.toLowerCase();
  const role = readRole(formData.get("role"));

  if (!teamId || !email) redirect("/business/team?error=missing-member-data");
  await requireTeamAdmin(teamId, session.user.id);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (!user) redirect(`/business/team?teamId=${teamId}&error=user-not-found`);

  await prisma.membership.upsert({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId,
      },
    },
    create: {
      accepted: true,
      role,
      teamId,
      userId: user.id,
    },
    update: {
      accepted: true,
      role,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/business/team");
  redirect(`/business/team?teamId=${teamId}`);
}

export async function updateBusinessTeamMemberRoleAction(formData: FormData) {
  const session = await getRequiredSession();
  const teamId = readNumber(formData.get("teamId"));
  const membershipId = readNumber(formData.get("membershipId"));
  const role = readRole(formData.get("role"));

  if (!teamId || !membershipId) redirect("/business/team?error=missing-member-data");
  await requireTeamAdmin(teamId, session.user.id);

  await prisma.membership.update({
    where: {
      id: membershipId,
    },
    data: {
      role,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/business/team");
  redirect(`/business/team?teamId=${teamId}`);
}

export async function removeBusinessTeamMemberAction(formData: FormData) {
  const session = await getRequiredSession();
  const teamId = readNumber(formData.get("teamId"));
  const membershipId = readNumber(formData.get("membershipId"));

  if (!teamId || !membershipId) redirect("/business/team?error=missing-member-data");
  await requireTeamAdmin(teamId, session.user.id);

  const membership = await prisma.membership.findUnique({
    where: {
      id: membershipId,
    },
    select: {
      role: true,
      userId: true,
    },
  });

  if (!membership || membership.userId === session.user.id) {
    redirect(`/business/team?teamId=${teamId}&error=cannot-remove-member`);
  }

  if (membership.role === MembershipRole.OWNER) {
    const ownerCount = await prisma.membership.count({
      where: {
        teamId,
        role: MembershipRole.OWNER,
        accepted: true,
      },
    });

    if (ownerCount <= 1) redirect(`/business/team?teamId=${teamId}&error=cannot-remove-owner`);
  }

  await prisma.membership.delete({
    where: {
      id: membershipId,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/business/team");
  redirect(`/business/team?teamId=${teamId}`);
}
