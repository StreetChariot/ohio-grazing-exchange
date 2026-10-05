import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { MemberBadges } from "@/components/member-badges";
import { ProfileAffiliations } from "@/components/profile-affiliations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALLIANCES, placeLabel } from "@/lib/alliances";
import { getMemberStats, getPublicProfile } from "@/lib/community";
import { isDemoOwnerId } from "@/lib/demo-owners";
import { formatPosted } from "@/lib/labels";
import { listOwnedListings } from "@/lib/listings";
import { roleSummary } from "@/lib/profile-affiliations";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  return { title: profile?.displayName ?? "Member" };
}

function PhotoStrip({ urls, label }: { urls: string[]; label: string }) {
  if (!urls.length) return null;
  return (
    <section className="grid gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
      <div className="flex flex-wrap gap-2">
        {urls.map((url) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url}
            src={url}
            alt=""
            className="h-32 w-32 rounded-md object-cover sm:h-40 sm:w-40"
          />
        ))}
      </div>
    </section>
  );
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  const [stats, listings] = await Promise.all([
    getMemberStats(profile),
    listOwnedListings(id),
  ]);
  const alliance = profile.allianceSlug ? ALLIANCES[profile.allianceSlug] : null;
  const landListings = listings.filter((listing) => listing.side === "land");
  const livestockListings = listings.filter((listing) => listing.side === "livestock");
  const isDemo =
    isDemoOwnerId(profile.id) || profile.displayName.startsWith("DEMO");

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex gap-4">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-20 shrink-0 rounded-md object-cover"
            />
          ) : null}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {isDemo ? <Badge variant="destructive">DEMO</Badge> : null}
              <h1 className="text-2xl font-semibold tracking-tight">{profile.displayName}</h1>
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt=""
                  className="h-10 w-10 rounded object-contain"
                />
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isDemo ? "Fictional DEMO member · " : ""}
              {profile.isAdmin ? "Host" : "Member"}
              {" · "}
              {roleSummary(profile)}
              {placeLabel(profile.homeState, profile.homeCounty)
                ? ` · ${placeLabel(profile.homeState, profile.homeCounty)}`
                : ""}
              {" · joined "}
              {formatPosted(profile.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {alliance ? (
            <Button asChild variant="outline">
              <Link href={`/alliances/${alliance.slug}`}>{alliance.name}</Link>
            </Button>
          ) : null}
          {profile.coops.map((coop) => (
            <Button key={coop.slug} asChild variant="outline">
              <Link href={`/forum/${coop.boardSlug}`}>{coop.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {isDemo ? (
        <p className="text-sm text-muted-foreground">
          This profile is a DEMO smoke-test fixture: photos, partnerships, co-ops,
          and both forage and livestock listings are fictional.
        </p>
      ) : null}

      <PhotoStrip urls={profile.pasturePhotos} label="Pasture and forage" />
      <PhotoStrip urls={profile.livestockPhotos} label="Livestock" />

      <Card>
        <CardHeader>
          <CardTitle>Affiliations</CardTitle>
          <CardDescription>
            Memberships, certifications, accreditations, and co-ops this member lists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileAffiliations profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reputation</CardTitle>
          <CardDescription>
            Confirmed grazes only. Either party logs it; the other party or a
            host confirms it.
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
              <p className="text-sm text-muted-foreground">Times grazed</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{stats.hostedCount}</p>
              <p className="text-sm text-muted-foreground">Times hosted</p>
            </div>
          </div>
          <MemberBadges badges={stats.badges} />
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Graze locations — forage listings ({landListings.length})
        </h2>
        {landListings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No forage listings on the board.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {landListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Grazers — livestock listings ({livestockListings.length})
        </h2>
        {livestockListings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No livestock listings on the board.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {livestockListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
