import type { Fencing, LandType, ListingSide, LivestockType, Season } from "./types";

export const SIDE_LABELS: Record<ListingSide, string> = {
  land: "Land",
  livestock: "Livestock",
};

export const LAND_TYPE_LABELS: Record<LandType, string> = {
  pasture: "Pasture",
  cover_crop: "Cover crop",
  crop_residue: "Crop residue",
  woodland: "Woodland",
  other: "Other",
};

export const LIVESTOCK_LABELS: Record<LivestockType, string> = {
  cattle: "Cattle",
  sheep: "Sheep",
  goats: "Goats",
  horses: "Horses",
  mixed: "Mixed",
  other: "Other",
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

export const FENCING_LABELS: Record<Fencing, string> = {
  none: "No fence — bring temporary",
  partial: "Partial fence",
  perimeter: "Perimeter fence",
};

export function formatPosted(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return formatDate(iso.slice(0, 10));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1)));
}

export function formatAcres(acres: number) {
  return `${acres % 1 === 0 ? acres.toFixed(0) : acres.toFixed(1)} acres`;
}
