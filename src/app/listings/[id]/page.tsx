import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FENCING_LABELS,
  formatAcres,
  formatDate,
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import { getListing } from "@/lib/listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  return { title: listing?.title ?? "Listing" };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_18rem]">
      <article className="grid gap-6">
        <div>
          <Button asChild variant="ghost" className="mb-3 -ml-2 px-2">
            <Link href="/listings">Back to listings</Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Badge>{SIDE_LABELS[listing.side]}</Badge>
            <Badge variant="outline">{listing.county} County</Badge>
            <Badge variant="secondary">{LIVESTOCK_LABELS[listing.livestockType]}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{listing.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Near {listing.nearestTown} ·{" "}
            {listing.seasons.map((season) => SEASON_LABELS[season]).join(", ")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What is on offer</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              <Row
                label="Dates"
                value={`${formatDate(listing.availableFrom)} – ${formatDate(listing.availableUntil)}`}
              />
              {listing.landType ? (
                <Row label="Forage" value={LAND_TYPE_LABELS[listing.landType]} />
              ) : null}
              {listing.acres ? <Row label="Acres" value={formatAcres(listing.acres)} /> : null}
              {listing.headCount ? (
                <Row label="Head" value={String(listing.headCount)} />
              ) : null}
              {listing.travelRadiusMiles != null ? (
                <Row label="Will travel" value={`${listing.travelRadiusMiles} miles`} />
              ) : null}
              {listing.fencing ? (
                <Row label="Fencing" value={FENCING_LABELS[listing.fencing]} />
              ) : null}
              {listing.waterAvailable != null ? (
                <Row label="Water" value={listing.waterAvailable ? "On site" : "Not on site"} />
              ) : null}
              {listing.rateNotes ? <Row label="Rate" value={listing.rateNotes} /> : null}
            </dl>
            <Separator className="my-4" />
            <p className="text-sm leading-6">{listing.description}</p>
          </CardContent>
        </Card>
      </article>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p className="font-medium">{listing.contactName}</p>
          <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${listing.contactEmail}`}>
            {listing.contactEmail}
          </a>
          {listing.contactPhone ? (
            <a className="text-primary underline-offset-4 hover:underline" href={`tel:${listing.contactPhone}`}>
              {listing.contactPhone}
            </a>
          ) : null}
          <p className="text-muted-foreground">
            Reach out directly. This first version does not hide contact behind an account.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
