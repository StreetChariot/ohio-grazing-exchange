import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganicListingMarks } from "@/components/partner-marks";
import {
  formatAcres,
  formatDate,
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
} from "@/lib/labels";
import { ALLIANCES, allianceForListing } from "@/lib/alliances";
import { listingDisplayTitle, organicBadgeLabel } from "@/lib/organic";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {listing.isDemo ? <Badge variant="destructive">DEMO</Badge> : null}
            <Badge variant={listing.side === "land" ? "default" : "secondary"}>
              {listing.side === "land" ? "Graze location" : "Grazer"}
            </Badge>
            <Badge variant="outline">
              {listing.county} County, {listing.state}
            </Badge>
            <Badge variant="outline">{ALLIANCES[allianceForListing(listing)].compass}</Badge>
            {listing.organicCertified ? (
              <OrganicListingMarks
                organicCertified
                organicCertifier={listing.organicCertifier}
                label={organicBadgeLabel(listing.side)}
              />
            ) : null}
          </div>
          <CardTitle className="text-base leading-snug">
            {listingDisplayTitle(listing)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>
            {LIVESTOCK_LABELS[listing.livestockType]}
            {listing.landType ? ` · ${LAND_TYPE_LABELS[listing.landType]}` : ""}
            {listing.acres ? ` · ${formatAcres(listing.acres)}` : ""}
            {listing.headCount ? ` · ${listing.headCount} head` : ""}
          </p>
          <p>
            {listing.seasons.map((season) => SEASON_LABELS[season]).join(", ")} ·{" "}
            {formatDate(listing.availableFrom)} – {formatDate(listing.availableUntil)}
          </p>
          <p>{listing.nearestTown}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
