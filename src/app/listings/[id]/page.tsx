import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteListingAction } from "@/app/listings/actions";
import { resolveGrazeAction } from "@/app/listings/graze-actions";
import { GrazeLogForm } from "@/components/graze-log-form";
import { ListingPhotoPanel } from "@/components/listing-photo-panel";
import { ListingRadiusMap } from "@/components/listing-radius-map";
import { MemberBadges } from "@/components/member-badges";
import { OrganicListingMarks } from "@/components/partner-marks";
import { PrintListingButton } from "@/components/print-listing-button";
import { ProfileAffiliations } from "@/components/profile-affiliations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ALLIANCES, allianceForListing } from "@/lib/alliances";
import { getAccount } from "@/lib/auth";
import { getListingGraze, getMemberStats, getPublicProfile } from "@/lib/community";
import { isDemoOwnerId } from "@/lib/demo-owners";
import {
  FENCING_LABELS,
  formatAcres,
  formatDate,
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import { LISTING_MAP_RADIUS_MILES } from "@/lib/listing-map";
import { getListing } from "@/lib/listings";
import {
  organicBadgeLabel,
  organicRestrictionNote,
  listingDisplayTitle,
} from "@/lib/organic";
import { PRODUCT_NAME } from "@/lib/region";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  return { title: listing ? listingDisplayTitle(listing) : "Listing" };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function listingPhotos(input: {
  side: "land" | "livestock";
  pasturePhotos: string[];
  livestockPhotos: string[];
}) {
  if (input.side === "land") {
    return input.pasturePhotos.length
      ? input.pasturePhotos
      : input.livestockPhotos;
  }
  return input.livestockPhotos.length
    ? input.livestockPhotos
    : input.pasturePhotos;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, account] = await Promise.all([getListing(id), getAccount()]);
  if (!listing) notFound();

  const alliance = ALLIANCES[allianceForListing(listing)];
  const [ownerProfile, grazes] = await Promise.all([
    listing.ownerId ? getPublicProfile(listing.ownerId) : Promise.resolve(null),
    getListingGraze(listing.id),
  ]);
  const ownerStats = ownerProfile ? await getMemberStats(ownerProfile) : null;
  const ownerIsDemo =
    listing.isDemo ||
    isDemoOwnerId(ownerProfile?.id) ||
    Boolean(ownerProfile?.displayName.startsWith("DEMO"));

  const canManage = Boolean(
    account && (account.isAdmin || account.id === listing.ownerId),
  );
  const contactVisible = Boolean(account && listing.contactEmail);
  const pending = grazes.find((record) => record.status === "pending");
  const confirmed = grazes.find((record) => record.status === "confirmed");
  const canLogGraze = Boolean(
    account &&
      listing.ownerId &&
      listing.ownerId !== account.id &&
      !pending &&
      !confirmed,
  );
  const canResolve = Boolean(
    pending &&
      account &&
      (account.isAdmin ||
        (pending.proposedBy !== account.id &&
          (pending.hostId === account.id || pending.grazierId === account.id))),
  );

  const sideLabel =
    listing.side === "land"
      ? "Graze location (forage)"
      : "Grazer (livestock seeking forage)";

  const photos = listingPhotos({
    side: listing.side,
    pasturePhotos: ownerProfile?.pasturePhotos ?? [],
    livestockPhotos: ownerProfile?.livestockPhotos ?? [],
  });

  return (
    <main className="listing-sheet mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_18rem]">
      <article className="listing-canvas grid gap-5">
        <div className="print:hidden flex flex-wrap items-center justify-between gap-2">
          <Button asChild variant="ghost" className="-ml-2 px-2">
            <Link href="/listings">Back to listings</Link>
          </Button>
          <PrintListingButton />
        </div>

        <header className="listing-header grid gap-2">
          <div className="flex flex-wrap gap-2">
            {listing.isDemo ? <Badge variant="destructive">DEMO</Badge> : null}
            <Badge>{SIDE_LABELS[listing.side]}</Badge>
            <Badge variant="outline">{sideLabel}</Badge>
            <Badge variant="outline">
              {listing.county} County, {listing.state}
            </Badge>
            <Badge variant="secondary">{LIVESTOCK_LABELS[listing.livestockType]}</Badge>
            {listing.organicCertified ? (
              <OrganicListingMarks
                organicCertified
                organicCertifier={listing.organicCertifier}
                label={organicBadgeLabel(listing.side)}
              />
            ) : null}
            <Badge asChild variant="outline" className="print:no-underline">
              <Link href={`/alliances/${alliance.slug}`}>{alliance.name}</Link>
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight print:text-2xl">
            {listingDisplayTitle(listing)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Near {listing.nearestTown}, {listing.state} ·{" "}
            {listing.seasons.map((season) => SEASON_LABELS[season]).join(", ")}
          </p>
          {listing.isDemo ? (
            <p className="text-sm text-muted-foreground print:hidden">
              Fictional DEMO listing for smoke testing. Graze logging works so you
              can exercise the confirmation flow; treat contacts and matches as
              non-real.
            </p>
          ) : null}
          {listing.organicCertified ? (
            <p className="text-sm text-muted-foreground">
              {organicRestrictionNote(listing.side)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground print:hidden">
              Conventional for this field or herd. Farms with organic acres or
              stock elsewhere can still match here when this listing is the
              conventional side of a split farm.
            </p>
          )}
        </header>

        {/* Uniform visual canvas: photos | 50mi map — same on every listing */}
        <section
          aria-label="Listing photos and area map"
          className="listing-visual-row grid gap-3 sm:grid-cols-2 sm:gap-4"
        >
          <ListingPhotoPanel
            side={listing.side}
            photos={photos}
            logoUrl={ownerProfile?.logoUrl ?? null}
          />
          <ListingRadiusMap
            latitude={listing.latitude}
            longitude={listing.longitude}
            nearestTown={listing.nearestTown}
            state={listing.state}
            side={listing.side}
            radiusMiles={LISTING_MAP_RADIUS_MILES}
          />
        </section>

        <Card className="listing-details shadow-none print:border">
          <CardHeader className="print:py-3">
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
                <Row
                  label="Water"
                  value={listing.waterAvailable ? "On site" : "Not on site"}
                />
              ) : null}
              {listing.rateNotes ? <Row label="Rate" value={listing.rateNotes} /> : null}
              <Row
                label="Organic"
                value={
                  listing.organicCertified
                    ? organicBadgeLabel(listing.side)
                    : "Not certified organic"
                }
              />
              <Row
                label="Map radius"
                value={`${LISTING_MAP_RADIUS_MILES} miles from listing pin`}
              />
            </dl>
            <Separator className="my-4" />
            <p className="text-sm leading-6">{listing.description}</p>
          </CardContent>
        </Card>

        <p className="listing-print-footer hidden text-xs text-muted-foreground print:block">
          {PRODUCT_NAME} · Printed listing poster · Tear-off / board copy for
          markets and bulletin boards
        </p>
      </article>

      <aside className="listing-sidebar grid h-fit gap-4">
        <Card className="print:border print:shadow-none">
          <CardHeader className="print:py-3">
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            {contactVisible ? (
              <>
                <p className="font-medium">{listing.contactName}</p>
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href={`mailto:${listing.contactEmail}`}
                >
                  {listing.contactEmail}
                </a>
                {listing.contactPhone ? (
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href={`tel:${listing.contactPhone}`}
                  >
                    {listing.contactPhone}
                  </a>
                ) : null}
                <p className="text-muted-foreground print:hidden">
                  Reach out directly. Arrangements stay between the two parties.
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Contact is for members. Create a free account to see the name,
                  email, and phone.
                </p>
                <Button asChild className="print:hidden">
                  <Link href={`/sign-in?next=/listings/${listing.id}`}>
                    Log in to see contact
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {ownerStats ? (
          <Card className="print:border print:shadow-none">
            <CardHeader className="print:py-3">
              <CardTitle className="flex flex-wrap items-center gap-2">
                {ownerIsDemo ? <Badge variant="destructive">DEMO</Badge> : null}
                <Link
                  className="underline-offset-4 hover:underline"
                  href={`/members/${ownerStats.profile.id}`}
                >
                  {ownerStats.profile.displayName}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <p className="text-muted-foreground print:hidden">
                Reputation {ownerStats.reputation} · {ownerStats.grazedCount} grazed ·{" "}
                {ownerStats.hostedCount} hosted
              </p>
              <div className="print:hidden">
                <MemberBadges badges={ownerStats.badges} />
              </div>
              <ProfileAffiliations profile={ownerStats.profile} />
              <Button asChild variant="outline" size="sm" className="w-fit print:hidden">
                <Link href={`/members/${ownerStats.profile.id}`}>
                  {ownerIsDemo ? "Full DEMO profile" : "Full profile"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {canLogGraze ? (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>
                {listing.isDemo ? "Log a DEMO graze" : "Log a completed graze"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {listing.isDemo ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Smoke-test only. Confirmations on DEMO listings exercise the
                  flow; they are not real matches.
                </p>
              ) : null}
              <GrazeLogForm
                listingId={listing.id}
                listingSide={listing.side}
                listingOrganic={listing.organicCertified}
              />
            </CardContent>
          </Card>
        ) : null}

        {pending &&
        account &&
        (canResolve || pending.hostId === account.id || pending.grazierId === account.id) ? (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>
                {canResolve ? "Confirm this graze" : "Graze waiting"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                {canResolve
                  ? "Confirm only if the animals actually grazed this listing."
                  : "Waiting on the listing owner or a host to confirm."}
              </p>
              {canResolve ? (
                <div className="flex gap-2">
                  <form action={resolveGrazeAction}>
                    <input type="hidden" name="grazeId" value={pending.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    <input type="hidden" name="next" value={`/listings/${listing.id}`} />
                    <Button type="submit" size="sm">
                      Confirm
                    </Button>
                  </form>
                  <form action={resolveGrazeAction}>
                    <input type="hidden" name="grazeId" value={pending.id} />
                    <input type="hidden" name="status" value="declined" />
                    <input type="hidden" name="next" value={`/listings/${listing.id}`} />
                    <Button type="submit" size="sm" variant="outline">
                      Decline
                    </Button>
                  </form>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {confirmed ? (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Graze confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This listing counts toward both members’ badges.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {canManage ? (
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle>Manage</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="next" value="/account" />
                <Button type="submit" variant="destructive">
                  Remove listing
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </main>
  );
}
