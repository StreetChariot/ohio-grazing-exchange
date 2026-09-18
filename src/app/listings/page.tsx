import type { Metadata } from "next";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters, MobileFilters } from "@/components/listing-filters";
import { OhioMap } from "@/components/ohio-map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasActiveFilters, parseFilters } from "@/lib/filters";
import {
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import { listListings } from "@/lib/listings";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse listings",
  description: "Search Ohio land and livestock grazing listings by county, animal, and season.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.error === "1") {
    throw new Error("Listings could not be loaded.");
  }

  const filters = parseFilters(params);
  const listings = await listListings(filters);
  const filtering = hasActiveFilters(filters);

  const summary = [
    filters.side ? SIDE_LABELS[filters.side] : null,
    filters.county ? `${filters.county} County` : null,
    filters.livestockType ? LIVESTOCK_LABELS[filters.livestockType] : null,
    filters.landType ? LAND_TYPE_LABELS[filters.landType] : null,
    filters.season ? SEASON_LABELS[filters.season] : null,
    filters.onDate ? `on ${filters.onDate}` : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[16rem_1fr]">
      <aside className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <ListingFilters defaults={filters} />
          </CardContent>
        </Card>
      </aside>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse listings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
              {summary.length > 0 ? ` · ${summary.join(" · ")}` : " across Ohio"}
            </p>
          </div>
          <div className="flex gap-2">
            <MobileFilters defaults={filters} />
            <Button asChild>
              <Link href="/listings/new">Post a listing</Link>
            </Button>
          </div>
        </div>

        <OhioMap listings={listings} />

        {listings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{filtering ? "No listings match" : "No listings yet"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>
                {filtering
                  ? "Nothing in the sample set fits those filters. Clear them, or post the listing you were hoping to find."
                  : "Be the first to post pasture, a cover crop, or a herd that needs forage."}
              </p>
              <div className="flex flex-wrap gap-2">
                {filtering ? (
                  <Button asChild variant="outline">
                    <Link href="/listings">Clear filters</Link>
                  </Button>
                ) : null}
                <Button asChild>
                  <Link href="/listings/new">Post a listing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <Alert>
          <AlertTitle>Contact stays on the listing</AlertTitle>
          <AlertDescription>
            Browse shows the match. Open a listing for the name, email, and phone.
            There is no messaging inbox in this first version.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  );
}
