import type {
  LandType,
  Listing,
  ListingFilters,
  ListingSide,
  LivestockType,
  Season,
} from "./types";
import { LAND_TYPES, LISTING_SIDES, LIVESTOCK_TYPES, SEASONS } from "./types";
import { isCountyInState } from "./region-counties";
import { isServiceState } from "./region";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asEnum<T extends string>(value: string | undefined, allowed: readonly T[]) {
  if (!value) return undefined;
  return (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ListingFilters {
  const county = one(params.county);
  const region = one(params.state);
  const onDate = one(params.onDate);
  return {
    side: asEnum<ListingSide>(one(params.side), LISTING_SIDES),
    state: isServiceState(region) ? region : undefined,
    county:
      isServiceState(region) && county && isCountyInState(region, county) ? county : undefined,
    livestockType: asEnum<LivestockType>(one(params.livestock), LIVESTOCK_TYPES),
    landType: asEnum<LandType>(one(params.landType), LAND_TYPES),
    season: asEnum<Season>(one(params.season), SEASONS),
    onDate: onDate && DATE.test(onDate) ? onDate : undefined,
  };
}

export function hasActiveFilters(filters: ListingFilters) {
  return Object.values(filters).some(Boolean);
}

export function matchesListing(listing: Listing, filters: ListingFilters) {
  if (filters.side && listing.side !== filters.side) return false;
  if (filters.state && listing.state !== filters.state) return false;
  if (filters.county && listing.county !== filters.county) return false;
  if (filters.livestockType && listing.livestockType !== filters.livestockType) {
    return false;
  }
  if (filters.landType && listing.landType !== filters.landType) return false;
  if (filters.season && !listing.seasons.includes(filters.season)) return false;
  if (filters.onDate) {
    if (filters.onDate < listing.availableFrom || filters.onDate > listing.availableUntil) {
      return false;
    }
  }
  return true;
}

export function filtersToSearchParams(filters: ListingFilters) {
  const params = new URLSearchParams();
  if (filters.side) params.set("side", filters.side);
  if (filters.state) params.set("state", filters.state);
  if (filters.county) params.set("county", filters.county);
  if (filters.livestockType) params.set("livestock", filters.livestockType);
  if (filters.landType) params.set("landType", filters.landType);
  if (filters.season) params.set("season", filters.season);
  if (filters.onDate) params.set("onDate", filters.onDate);
  return params;
}
