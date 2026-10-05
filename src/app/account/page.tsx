import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteListingAction } from "@/app/listings/actions";
import { resolveGrazeAction } from "@/app/listings/graze-actions";
import { ChangePasswordForm } from "@/components/change-password-form";
import { HomePlaceForm } from "@/components/home-place-form";
import { ListingCard } from "@/components/listing-card";
import { MemberBadges } from "@/components/member-badges";
import { ProfileAffiliations } from "@/components/profile-affiliations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALLIANCES } from "@/lib/alliances";
import { getAccount } from "@/lib/auth";
import { getMemberStats, getPublicProfile, listGrazeRecordsForUser } from "@/lib/community";
import { listOwnedListings } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Ohio Valley Grazing Exchange profile, listings, alliance, and co-ops.",
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const account = await getAccount();
  if (!account) {
    redirect("/sign-in?next=/account");
  }

  const profile = await getPublicProfile(account.id);
  const [listings, grazes, stats] = await Promise.all([
    listOwnedListings(account.id),
    listGrazeRecordsForUser(account.id),
    profile
      ? getMemberStats(profile)
      : Promise.resolve({
          grazedCount: 0,
          hostedCount: 0,
          reputation: 0,
          badges: [],
        }),
  ]);
  const alliance = account.allianceSlug ? ALLIANCES[account.allianceSlug] : null;
  const awaitingYou = grazes.pending.filter((record) => record.proposedBy !== account.id);
  const awaitingThem = grazes.pending.filter((record) => record.proposedBy === account.id);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {account.displayName}
            {account.email ? ` · ${account.email}` : ""}
            {account.isAdmin ? " · host" : " · member"}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline">
            <Link href={`/members/${account.id}`}>Public profile</Link>
          </Button>
          <Button asChild>
            <Link href="/listings/new">Post a listing</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Roles, place, memberships, certifications, co-ops, and optional
              FarmTec research stats. You can be both a forage host and a
              grazier.{" "}
              {alliance ? (
                <Link className="text-primary underline-offset-4 hover:underline" href={`/alliances/${alliance.slug}`}>
                  {alliance.name}
                </Link>
              ) : (
                "Not in an alliance yet."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HomePlaceForm account={account} />
          </CardContent>
        </Card>

        <div className="grid gap-6 content-start">
          {profile ? (
            <Card>
              <CardHeader>
                <CardTitle>How others see you</CardTitle>
                <CardDescription>Public badges from your saved profile.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileAffiliations profile={profile} />
              </CardContent>
            </Card>
          ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change the password for {account.email ?? "this account"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reputation and badges</CardTitle>
            <CardDescription>
              Reputation is confirmed grazes as livestock plus confirmed grazes
              as land. The other party has to confirm.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl font-semibold">{stats.reputation}</p>
                <p className="text-sm text-muted-foreground">Reputation</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats.grazedCount}</p>
                <p className="text-sm text-muted-foreground">Grazed</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{stats.hostedCount}</p>
                <p className="text-sm text-muted-foreground">Hosted</p>
              </div>
            </div>
            <MemberBadges badges={stats.badges} />
          </CardContent>
        </Card>
        </div>
      </div>

      {awaitingYou.length > 0 || awaitingThem.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Graze confirmations</CardTitle>
            <CardDescription>
              Confirm only if the animals actually grazed. This is how badges stay honest.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {awaitingYou.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm">
                  Waiting on you: {record.listingTitle ?? "a listing"}
                </p>
                <div className="flex gap-2">
                  <form action={resolveGrazeAction}>
                    <input type="hidden" name="grazeId" value={record.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <input type="hidden" name="next" value="/account" />
                    <Button type="submit" size="sm">
                      Confirm
                    </Button>
                  </form>
                  <form action={resolveGrazeAction}>
                    <input type="hidden" name="grazeId" value={record.id} />
                    <input type="hidden" name="status" value="declined" />
                    <input type="hidden" name="next" value="/account" />
                    <Button type="submit" size="sm" variant="outline">
                      Decline
                    </Button>
                  </form>
                </div>
              </div>
            ))}
            {awaitingThem.map((record) => (
              <p key={record.id} className="text-sm text-muted-foreground">
                Waiting on the other party: {record.listingTitle ?? "a listing"}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {listings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No listings yet</CardTitle>
            <CardDescription>
              Post land or livestock. Other members will see your contact once they log in.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <div key={listing.id} className="grid gap-2">
              <ListingCard listing={listing} />
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="next" value="/account" />
                <Button type="submit" variant="outline" size="sm">
                  Remove
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
