"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters, MobileFilters } from "@/components/listing-filters";
import { ValleyMap } from "@/components/valley-map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filtersToSearchParams, hasActiveFilters, matchesListing } from "@/lib/filters";
import {
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import { isCountyInState } from "@/lib/region-counties";
import type { Listing, ListingFilters as FilterValues } from "@/lib/types";

function cleanFilters(next: FilterValues): FilterValues {
  if (next.county && !isCountyInState(next.state, next.county)) {
    const { county: _county, ...rest } = next;
    return rest;
  }
  return next;
}

function writeFilterUrl(filters: FilterValues) {
  const query = filtersToSearchParams(filters).toString();
  const next = query ? `/listings?${query}` : "/listings";
  const current = `${window.location.pathname}${window.location.search}`;
  if (current !== next) {
    window.history.replaceState(null, "", next);
  }
}

export function BrowseListings({
  listings,
  initialFilters,
}: {
  listings: Listing[];
  initialFilters: FilterValues;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const visible = useMemo(
    () => listings.filter((listing) => matchesListing(listing, filters)),
    [listings, filters],
  );
  const filtering = hasActiveFilters(filters);
  const summary = [
    filters.side ? SIDE_LABELS[filters.side] : null,
    filters.state ?? null,
    filters.county ? `${filters.county} County` : null,
    filters.livestockType ? LIVESTOCK_LABELS[filters.livestockType] : null,
    filters.landType ? LAND_TYPE_LABELS[filters.landType] : null,
    filters.season ? SEASON_LABELS[filters.season] : null,
    filters.onDate ? `on ${filters.onDate}` : null,
  ].filter(Boolean);

  function update(next: FilterValues) {
    const cleaned = cleanFilters(next);
    setFilters(cleaned);
    writeFilterUrl(cleaned);
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[16rem_1fr]">
      <aside className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <p className="text-sm text-muted-foreground">
              The map and the list update as you set these.
            </p>
          </CardHeader>
          <CardContent>
            <ListingFilters filters={filters} onChange={update} />
          </CardContent>
        </Card>
      </aside>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse listings</h1>
            <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
              {visible.length} {visible.length === 1 ? "listing" : "listings"}
              {summary.length > 0 ? ` · ${summary.join(" · ")}` : " in the Ohio Valley"}
            </p>
          </div>
          <div className="flex gap-2">
            <MobileFilters filters={filters} onChange={update} />
            <Button asChild>
              <Link href="/listings/new">Post a listing</Link>
            </Button>
          </div>
        </div>

        <ValleyMap listings={visible} />

        {visible.length === 0 ? (
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
                  <Button type="button" variant="outline" onClick={() => update({})}>
                    Clear filters
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
            {visible.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <Alert>
          <AlertTitle>Contact is for members</AlertTitle>
          <AlertDescription>
            Browse stays open. Log in to see names, email, and phone on a listing,
            or to post one. There is no paid plan and no messaging inbox yet.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  );
}
