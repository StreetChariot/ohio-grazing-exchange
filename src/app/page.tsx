import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

const midwestStates = [
  "Illinois",
  "Indiana",
  "Iowa",
  "Michigan",
  "Minnesota",
  "Missouri",
  "Wisconsin",
];

export default async function HomePage() {
  const listings = await listListings();
  const land = listings.filter((listing) => listing.side === "land").length;
  const livestock = listings.filter((listing) => listing.side === "livestock").length;

  return (
    <main>
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:py-16 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Ohio only</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              The grazing match Ohio has been missing.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              Landowners with pasture, cover crops, crop residue, or woods meet
              livestock producers who need forage. Same two-sided exchange the
              upper Midwest already uses. Ohio was left off that map.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/listings">Browse listings</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/listings/new">Post a listing</Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Open right now</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-semibold">{land}</p>
                <p className="text-sm text-muted-foreground">Land listings</p>
              </div>
              <div>
                <p className="text-3xl font-semibold">{livestock}</p>
                <p className="text-sm text-muted-foreground">Livestock listings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Have land</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              List pasture, a cover crop, corn or bean residue, or woodland you
              want grazed. Say the county, the dates, the livestock you will
              accept, and whether fence and water are already there.
            </p>
            <p>You are looking for animals. The other side is looking for feed.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Have livestock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <p>
              List the herd, how many head, how far you will haul, and the
              season you need forage. Cattle, sheep, goats, and horses all
              belong here.
            </p>
            <p>You are looking for grass, residue, or browse. Not a sale barn.</p>
          </CardContent>
        </Card>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-primary">1</p>
            <h2 className="mt-1 font-medium">Filter the state</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Narrow by land or livestock, Ohio county, livestock type, forage,
              and the season or a specific date.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-primary">2</p>
            <h2 className="mt-1 font-medium">Read the listing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Acres or head count, fencing, water, and a rate note if they
              posted one. Contact is on the listing.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-primary">3</p>
            <h2 className="mt-1 font-medium">Make the deal yourselves</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This site introduces the two sides. Lease terms, insurance, and
              who checks the fence are yours to settle.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold tracking-tight">Why this exists</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
          Midwest Grazing Exchange at midwestgrazingexchange.com connects
          graziers and landowners in {midwestStates.slice(0, -1).join(", ")}, and{" "}
          {midwestStates.at(-1)}. Ohio is not one of those states. This exchange
          covers the gap: one state, both sides of the match, listings you can
          search and post today.
        </p>
      </section>
    </main>
  );
}
