import type { Metadata } from "next";
import Link from "next/link";
import { AllianceMark } from "@/components/alliance-mark";
import { PartnerMarksStrip } from "@/components/partner-marks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALLIANCE_LIST, allianceForListing } from "@/lib/alliances";
import { listAllianceMembers } from "@/lib/community";
import { listListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regional alliances",
  description:
    "Four quadrant alliances covering Ohio, Pennsylvania, Kentucky, and West Virginia.",
};

export default async function AlliancesPage() {
  const listings = await listListings();
  const listingCounts = Object.fromEntries(
    ALLIANCE_LIST.map((alliance) => [
      alliance.slug,
      listings.filter((listing) => allianceForListing(listing) === alliance.slug).length,
    ]),
  ) as Record<string, number>;

  const memberCounts = Object.fromEntries(
    await Promise.all(
      ALLIANCE_LIST.map(async (alliance) => [
        alliance.slug,
        (await listAllianceMembers(alliance.slug)).length,
      ]),
    ),
  ) as Record<string, number>;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Regional alliances</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          The four states sit as quadrants of the Ohio Valley. Join the alliance
          for your home county. Cross-border grazing still happens on the
          public board; the alliance is the neighborhood.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ALLIANCE_LIST.map((alliance) => (
          <Link key={alliance.slug} href={`/alliances/${alliance.slug}`} className="block h-full">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <AllianceMark slug={alliance.slug} className="size-12" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {alliance.compass}
                    </p>
                    <CardTitle>{alliance.name}</CardTitle>
                    <CardDescription>{alliance.coverage}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm leading-6">{alliance.summary}</p>
                <p className="text-sm text-muted-foreground">
                  {memberCounts[alliance.slug] ?? 0}{" "}
                  {(memberCounts[alliance.slug] ?? 0) === 1 ? "member" : "members"} ·{" "}
                  {listingCounts[alliance.slug] ?? 0}{" "}
                  {(listingCounts[alliance.slug] ?? 0) === 1 ? "listing" : "listings"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <PartnerMarksStrip showCertifiers />
    </main>
  );
}
