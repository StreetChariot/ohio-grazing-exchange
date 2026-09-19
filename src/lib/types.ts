import type { ServiceState } from "./region";

export const LISTING_SIDES = ["land", "livestock"] as const;
export const LAND_TYPES = [
  "pasture",
  "cover_crop",
  "crop_residue",
  "woodland",
  "other",
] as const;
export const LIVESTOCK_TYPES = [
  "cattle",
  "sheep",
  "goats",
  "horses",
  "mixed",
  "other",
] as const;
export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export const FENCING_OPTIONS = ["none", "partial", "perimeter"] as const;

export type ListingSide = (typeof LISTING_SIDES)[number];
export type LandType = (typeof LAND_TYPES)[number];
export type LivestockType = (typeof LIVESTOCK_TYPES)[number];
export type Season = (typeof SEASONS)[number];
export type Fencing = (typeof FENCING_OPTIONS)[number];

export type Listing = {
  id: string;
  side: ListingSide;
  title: string;
  state: ServiceState;
  county: string;
  nearestTown: string;
  latitude: number;
  longitude: number;
  landType: LandType | null;
  livestockType: LivestockType;
  seasons: Season[];
  availableFrom: string;
  availableUntil: string;
  acres: number | null;
  headCount: number | null;
  travelRadiusMiles: number | null;
  fencing: Fencing | null;
  waterAvailable: boolean | null;
  rateNotes: string | null;
  description: string;
  /** Certified organic pasture/forage (land) or organic herd (livestock) for this listing only. */
  organicCertified: boolean;
  /** USDA NOP accredited certifying agent when organicCertified. */
  organicCertifier: string | null;
  /** Seed / sample board listings for browsing before real posts exist. */
  isDemo: boolean;
  ownerId: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
};

export type ListingFilters = {
  side?: ListingSide;
  state?: ServiceState;
  county?: string;
  livestockType?: LivestockType;
  landType?: LandType;
  season?: Season;
  onDate?: string;
  /** When true, only certified-organic listings. */
  organicOnly?: boolean;
};

export type ListingInput = {
  side: ListingSide;
  title: string;
  state: ServiceState;
  county: string;
  nearestTown: string;
  landType: LandType | null;
  livestockType: LivestockType;
  seasons: Season[];
  availableFrom: string;
  availableUntil: string;
  acres: number | null;
  headCount: number | null;
  travelRadiusMiles: number | null;
  fencing: Fencing | null;
  waterAvailable: boolean | null;
  rateNotes: string | null;
  description: string;
  organicCertified: boolean;
  organicCertifier: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
};
