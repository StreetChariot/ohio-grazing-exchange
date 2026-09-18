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
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  createdAt: string;
};

export type ListingFilters = {
  side?: ListingSide;
  county?: string;
  livestockType?: LivestockType;
  landType?: LandType;
  season?: Season;
  onDate?: string;
};

export type ListingInput = {
  side: ListingSide;
  title: string;
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
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
};
