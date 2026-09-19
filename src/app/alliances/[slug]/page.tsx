import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AllianceMark } from "@/components/alliance-mark";
import { ListingCard } from "@/components/listing-card";
import { MemberBadges } from "@/components/member-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { allianceBySlug, isAllianceSlug, placeLabel } from "@/lib/alliances";
import { getAccount } from "@/lib/auth";
import {
  listAllianceListings,
  listAllianceMembers,
  memberStatsForProfiles,
} from "@/lib/community";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const alliance = allianceBySlug(slug);
  return { title: alliance?.name ?? "Alliance" };
}

export default async function AlliancePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isAllianceSlug(slug)) notFound();
  const alliance = allianceBySlug(slug);
  if (!alliance) notFound();

  const [members, listings, account] = await Promise.all([
    listAllianceMembers(slug),
    listAllianceListings(slug),
    getAccount(),
  ]);
  const memberStats = await memberStatsForProfiles(members);
  const inThisAlliance = account?.allianceSlug === slug;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-4">
          <AllianceMark slug={alliance.slug} className="size-16" title={alliance.name} />
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {alliance.compass} · {alliance.coverage}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{alliance.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
              {alliance.summary}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href={`/forum/${slug}`}>Alliance forum</Link>
          </Button>
          {inThisAlliance ? (
            <Button asChild>
              <Link href="/account">Your place</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/account">Join from your account</Link>
            </Button>
          )}
        </div>
      </div>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Members</h2>
        {memberStats.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No members in this quadrant yet</CardTitle>
              <CardDescription>
                Set a home county on your account to stand here. Listings in this
                quadrant still show below.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {memberStats.map((member) => (
              <Link key={member.profile.id} href={`/members/${member.profile.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {member.profile.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.profile.avatarUrl}
                          alt=""
                          className="size-10 shrink-0 rounded-md object-cover"
                        />
                      ) : null}
                      <div className="min-w-0">
                        <CardTitle className="text-base">{member.profile.displayName}</CardTitle>
                        <CardDescription>
                          {placeLabel(member.profile.homeState, member.profile.homeCounty) ??
                            alliance.name}
                          {member.profile.isAdmin ? " · host" : ""}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <p className="text-sm text-muted-foreground">
                      Reputation {member.reputation} · {member.grazedCount} grazed ·{" "}
                      {member.hostedCount} hosted
                    </p>
                    <MemberBadges badges={member.badges} empty="Valley member." />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Listings in this quadrant</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing posted in this quadrant yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
