import Link from "next/link";
import { pinPosition } from "@/lib/counties";
import { SIDE_LABELS } from "@/lib/labels";
import type { Listing } from "@/lib/types";

export function OhioMap({ listings }: { listings: Listing[] }) {
  return (
    <section aria-label="Schematic map of Ohio listings" className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium">Ohio map</h2>
          <p className="text-sm text-muted-foreground">
            Pins sit on county centers. Open a listing from the map or the list.
          </p>
        </div>
        <div className="hidden gap-3 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-land" /> Land
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-herd" /> Livestock
          </span>
        </div>
      </div>
      <div className="relative h-72 overflow-hidden rounded-xl border bg-[oklch(0.94_0.03_145)] sm:h-96">
        <div
          aria-hidden
          className="absolute inset-6 rounded-[40%_45%_42%_48%] border border-primary/20 bg-[oklch(0.9_0.04_140)]"
        />
        <p className="absolute top-3 left-3 text-xs font-medium tracking-wide text-primary/80 uppercase">
          Ohio
        </p>
        {listings.map((listing) => {
          const position = pinPosition(listing.latitude, listing.longitude);
          return (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              title={`${SIDE_LABELS[listing.side]} · ${listing.title}`}
              style={{ left: position.left, top: position.top }}
              className={`absolute z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background ${
                listing.side === "land" ? "bg-land" : "bg-herd"
              }`}
            >
              <span className="sr-only">
                {SIDE_LABELS[listing.side]} in {listing.county} County: {listing.title}
              </span>
            </Link>
          );
        })}
        {listings.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
            No pins for this filter.
          </p>
        ) : null}
      </div>
    </section>
  );
}
