import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { prisma } from "@calcom/prisma";
import { MembershipRole } from "@calcom/prisma/enums";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import { buildLegacyRequest } from "@lib/buildLegacyCtx";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardSidebar } from "~/business/components/GoBookMeMarketplace";

import {
  addBusinessTeamMemberAction,
  createBusinessTeamAction,
  removeBusinessTeamMemberAction,
  updateBusinessTeamMemberRoleAction,
} from "./actions";

type BusinessTeamPageProps = {
  searchParams: Promise<{ error?: string; teamId?: string }>;
};

export const metadata = {
  title: "Team members | GoBookME",
};

export default async function BusinessTeamPage({ searchParams }: BusinessTeamPageProps) {
  const session = await getServerSession({ req: buildLegacyRequest(await headers(), await cookies()) });
  if (!session?.user?.id) redirect("/auth/login");

  const { error, teamId } = await searchParams;
  const teams = await getManagedTeams(session.user.id);
  const selectedTeam =
    teams.find((team) => String(team.id) === teamId) ??
    teams.find((team) => team.businessListings.length > 0) ??
    teams[0] ??
    null;

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-950">
      <DashboardSidebar activeItem="Team" />
      <section className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                Go
              </span>
              GoBookME
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-slate-950">Team Members</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage staff for your service business. Each member keeps their own availability, calendar, and
              assigned bookings.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            href="/event-types">
            Manage Team Services
          </Link>
        </header>

        {error ? <ErrorBanner error={error} /> : null}

        {teams.length > 1 ? (
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Business teams">
            {teams.map((team) => (
              <Link
                key={team.id}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm ${
                  selectedTeam?.id === team.id
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
                href={`/business/team?teamId=${team.id}`}>
                {team.name}
              </Link>
            ))}
          </nav>
        ) : null}

        {!selectedTeam ? (
          <CreateTeamCard />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <TeamSummary team={selectedTeam} />
              <MembersTable currentUserId={session.user.id} team={selectedTeam} />
            </section>

            <aside className="space-y-6">
              <AddMemberCard teamId={selectedTeam.id} />
              <TeamOperationsCard team={selectedTeam} />
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

type ManagedTeam = {
  id: number;
  name: string;
  slug: string | null;
  businessListings: Array<{
    id: string;
    displayName: string;
    slug: string;
    city: string;
  }>;
  eventTypes: Array<{
    id: number;
    title: string;
    slug: string;
    hidden: boolean;
    length: number;
    price: number;
    currency: string;
  }>;
  members: Array<{
    id: number;
    accepted: boolean;
    role: MembershipRole;
    userId: number;
    user: {
      id: number;
      name: string | null;
      email: string;
      username: string | null;
      timeZone: string;
      defaultScheduleId: number | null;
      schedules: Array<{
        id: number;
        name: string;
      }>;
      eventTypes: Array<{
        id: number;
        title: string;
        slug: string;
        hidden: boolean;
      }>;
      bookings: Array<{
        id: number;
      }>;
    };
  }>;
};

async function getManagedTeams(userId: number): Promise<ManagedTeam[]> {
  return await prisma.team.findMany({
    where: {
      isOrganization: false,
      members: {
        some: {
          userId,
          accepted: true,
          role: {
            in: [MembershipRole.OWNER, MembershipRole.ADMIN],
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      businessListings: {
        select: {
          id: true,
          displayName: true,
          slug: true,
          city: true,
        },
      },
      eventTypes: {
        select: {
          id: true,
          title: true,
          slug: true,
          hidden: true,
          length: true,
          price: true,
          currency: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      members: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          accepted: true,
          role: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              timeZone: true,
              defaultScheduleId: true,
              schedules: {
                select: {
                  id: true,
                  name: true,
                },
                orderBy: {
                  name: "asc",
                },
              },
              eventTypes: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  hidden: true,
                },
                orderBy: {
                  position: "asc",
                },
              },
              bookings: {
                where: {
                  endTime: {
                    gte: new Date(),
                  },
                },
                select: {
                  id: true,
                },
                take: 20,
              },
            },
          },
        },
      },
    },
  });
}

function CreateTeamCard() {
  const createTeamAction = createBusinessTeamAction as unknown as string;

  return (
    <section className="max-w-3xl rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <Icon name="users" className="h-5 w-5" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-950">Create your business team workspace</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use a team workspace when your business has multiple providers, cleaners, stylists, or staff members.
        Your public listing can stay the same, while each member manages their own schedule.
      </p>
      <form action={createTeamAction} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Team name</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
            name="name"
            placeholder="Example: Sparkle Clean Team"
          />
        </label>
        <Button className="self-end" color="primary" type="submit">
          Create Team
        </Button>
      </form>
    </section>
  );
}

function TeamSummary({ team }: { team: ManagedTeam }) {
  const activeServices = team.eventTypes.filter((eventType) => !eventType.hidden).length;
  const upcomingBookings = team.members.reduce((total, member) => total + member.user.bookings.length, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Business team</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">{team.name}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {team.businessListings.length > 0
              ? `Connected to ${team.businessListings.map((listing) => listing.displayName).join(", ")}`
              : "Not connected to a public business listing yet."}
          </p>
        </div>
        {team.businessListings[0] ? (
          <Link
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            href={`/business/${team.businessListings[0].slug}?preview=1`}>
            Preview Listing
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Members" value={team.members.length} />
        <Metric label="Team services" value={activeServices} />
        <Metric label="Upcoming bookings" value={upcomingBookings} />
      </div>
    </section>
  );
}

function MembersTable({ currentUserId, team }: { currentUserId: number; team: ManagedTeam }) {
  const updateRoleAction = updateBusinessTeamMemberRoleAction as unknown as string;
  const removeMemberAction = removeBusinessTeamMemberAction as unknown as string;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-950">Staff members</h2>
        <p className="mt-1 text-sm text-slate-500">
          Staff members can be assigned to team services. Their own schedules control when customers can book
          them.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {team.members.map((member) => {
          const defaultSchedule = member.user.schedules.find((schedule) => schedule.id === member.user.defaultScheduleId);
          const visibleServices = member.user.eventTypes.filter((eventType) => !eventType.hidden);

          return (
            <div key={member.id} className="grid gap-4 p-6 xl:grid-cols-[1.1fr_0.9fr_220px]">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 font-bold text-white">
                    {(member.user.name ?? member.user.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{member.user.name ?? "Unnamed member"}</p>
                    <p className="text-sm text-slate-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{member.role}</span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    {member.accepted ? "Active" : "Invited"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {member.user.timeZone}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-600">
                <StatusRow
                  label="Default schedule"
                  value={defaultSchedule?.name ?? (member.user.defaultScheduleId ? "Configured" : "Not set")}
                />
                <StatusRow label="Schedules" value={`${member.user.schedules.length} schedule(s)`} />
                <StatusRow label="Own services" value={`${visibleServices.length} service(s)`} />
                <StatusRow label="Upcoming bookings" value={`${member.user.bookings.length}`} />
              </div>

              <div className="space-y-3">
                <form action={updateRoleAction} className="flex gap-2">
                  <input name="teamId" type="hidden" value={team.id} />
                  <input name="membershipId" type="hidden" value={member.id} />
                  <select
                    className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    defaultValue={member.role}
                    disabled={member.role === MembershipRole.OWNER}
                    name="role">
                    <option value={MembershipRole.MEMBER}>Member</option>
                    <option value={MembershipRole.ADMIN}>Admin</option>
                  </select>
                  <Button
                    color="secondary"
                    disabled={member.role === MembershipRole.OWNER}
                    type="submit">
                    Save
                  </Button>
                </form>

                <div className="flex gap-2">
                  <Button
                    color="secondary"
                    href={member.user.defaultScheduleId ? `/availability/${member.user.defaultScheduleId}` : "/availability"}
                    target={member.userId === currentUserId ? undefined : "_blank"}>
                    Schedule
                  </Button>
                  <form action={removeMemberAction}>
                    <input name="teamId" type="hidden" value={team.id} />
                    <input name="membershipId" type="hidden" value={member.id} />
                    <Button
                      color="destructive"
                      disabled={member.userId === currentUserId || member.role === MembershipRole.OWNER}
                      type="submit">
                      Remove
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AddMemberCard({ teamId }: { teamId: number }) {
  const addMemberAction = addBusinessTeamMemberAction as unknown as string;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">Add team member</h2>
      <p className="mt-1 text-sm text-slate-500">
        Add an existing GoBookME account by email. New-user email invites can come next.
      </p>
      <form action={addMemberAction} className="mt-5 space-y-4">
        <input name="teamId" type="hidden" value={teamId} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
            name="email"
            placeholder="member@example.com"
            type="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Role</span>
          <select className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" name="role">
            <option value={MembershipRole.MEMBER}>Member</option>
            <option value={MembershipRole.ADMIN}>Admin</option>
          </select>
        </label>
        <Button className="w-full justify-center" color="primary" type="submit">
          Add Member
        </Button>
      </form>
    </section>
  );
}

function TeamOperationsCard({ team }: { team: ManagedTeam }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-950">How team booking works</h2>
      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
        <p>
          Team members keep their own availability. GoBookME uses those schedules when customers book a
          team service.
        </p>
        <p>
          For a cleaning team, create one team service like “Standard Cleaning,” then assign the staff members
          who can provide it.
        </p>
      </div>
      <div className="mt-5 grid gap-2">
        <Link
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          href="/event-types">
          Create or edit team services
        </Link>
        <Link
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
          href="/availability">
          Edit your own availability
        </Link>
        {team.businessListings[0] ? (
          <Link
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            href={`/business/manage?edit=${team.businessListings[0].id}`}>
            Manage connected listing
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function ErrorBanner({ error }: { error: string }) {
  const message =
    {
      "cannot-remove-member": "You cannot remove yourself from this team.",
      "cannot-remove-owner": "A team must keep at least one owner.",
      "missing-member-data": "Please enter the required member details.",
      "not-authorized": "Only team admins and owners can manage this team.",
      "user-not-found": "That email does not belong to an existing GoBookME account yet.",
    }[error] ?? "We could not complete that team action.";

  return (
    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-800">{message}</p>
    </div>
  );
}
