import Link from "next/link";
import { cookies } from "next/headers";
import { HomeHero } from "@/components/home-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  INTRO_COLLAPSED,
  INTRO_COOKIE,
  INTRO_DISMISSED,
} from "@/lib/intro-preference";
import { listListings } from "@/lib/listings";
import { MIDWEST_EXCHANGE_STATES } from "@/lib/region";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listings = await listListings();
  const intro = (await cookies()).get(INTRO_COOKIE)?.value;
  const land = listings.filter((listing) => listing.side === "land").length;
  const livestock = listings.filter((listing) => listing.side === "livestock").length;

  return (
    <main>
      <HomeHero
        dismissed={intro === INTRO_DISMISSED}
        collapsed={intro === INTRO_COLLAPSED}
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-[1fr_16rem] md:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Open right now</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {land} land {land === 1 ? "listing" : "listings"} and {livestock} livestock{" "}
            {livestock === 1 ? "listing" : "listings"}. Posting is open for Ohio
            counties today. Pennsylvania, Kentucky, and West Virginia are in the
            exchange; their county lists come next.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/listings">Browse listings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/listings/new">Post a listing</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>On the board</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-semibold">{land}</p>
              <p className="text-sm text-muted-foreground">Land</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{livestock}</p>
              <p className="text-sm text-muted-foreground">Livestock</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-semibold tracking-tight">This side of the bridge</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            The Midwest Grazing Exchange covers{" "}
            {MIDWEST_EXCHANGE_STATES.slice(0, -1).join(", ")}, and{" "}
            {MIDWEST_EXCHANGE_STATES.at(-1)}. Pennsylvania, Kentucky, and West
            Virginia do not have a grazing exchange of their own, and neither does
            Ohio. Those four are the Ohio Valley: Appalachian ground and the farm
            counties that sit against Indiana. Indiana stays with the Midwest
            exchange. This one is built so a later link can carry listings across
            that line.
          </p>
        </div>
      </section>
    </main>
  );
}
