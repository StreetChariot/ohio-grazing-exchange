import type { Listing, ListingSide } from "./types";

/** Short badge label for cards and headers. */
export function organicBadgeLabel(side: ListingSide) {
  return side === "land" ? "Organic pasture" : "Organic herd";
}

/** Longer note shown on listing detail and graze forms. */
export function organicRestrictionNote(side: ListingSide) {
  if (side === "land") {
    return "This listing is certified organic forage only. Organic herds may graze here; conventional herds cannot. Post conventional acres as a separate listing if the farm also has non-organic ground.";
  }
  return "This listing is an organic certified herd. They may only graze certified organic pasture or forage. Conventional fields need a separate non-organic listing.";
}

export function organicCounterpartLabel(side: ListingSide) {
  return side === "land" ? "organic certified herd" : "certified organic pasture or forage";
}

/**
 * Organic rules are per listing, not per farm.
 * A farm may hold both organic and conventional acres or herds as separate listings.
 * Only organic listings require counterpart attestation for a completed graze.
 */
export function organicGrazeBlockReason(input: {
  listing: Pick<Listing, "organicCertified" | "side">;
  counterpartAttested: boolean;
}): string | null {
  if (!input.listing.organicCertified) return null;
  if (input.counterpartAttested) return null;
  return `This listing is ${organicBadgeLabel(input.listing.side).toLowerCase()}. Confirm your ${organicCounterpartLabel(input.listing.side)} for this graze before logging it.`;
}

/** Known seed / sample listing IDs (a1000000-… range). */
export function isDemoListingId(id: string) {
  return /^a1000000-0000-4000-8000-[0-9a-f]{12}$/i.test(id);
}

export function listingDisplayTitle(listing: Pick<Listing, "title" | "isDemo">) {
  if (!listing.isDemo) return listing.title;
  if (/^demo\b/i.test(listing.title.trim())) return listing.title;
  return `DEMO · ${listing.title}`;
}
