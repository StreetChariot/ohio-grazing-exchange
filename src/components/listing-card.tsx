import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatAcres,
  formatDate,
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import type { Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link href={`/listings/${listing.id}`} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={listing.side === "land" ? "default" : "secondary"}>
              {SIDE_LABELS[listing.side]}
            </Badge>
            <Badge variant="outline">{listing.county} County</Badge>
          </div>
          <CardTitle className="text-base leading-snug">{listing.title}</CardTitle>
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
