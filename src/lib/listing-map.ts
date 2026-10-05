import { projectValley } from "@/lib/valley-project";

const MILES_PER_DEG_LAT = 69.0;

/** Approximate projected SVG radius for a ground distance in miles. */
export function projectedRadiusMiles(
  longitude: number,
  latitude: number,
  miles: number,
) {
  const center = projectValley(longitude, latitude);
  if (!center) return null;
  const latRad = (latitude * Math.PI) / 180;
  const degLon = miles / (MILES_PER_DEG_LAT * Math.max(0.2, Math.cos(latRad)));
  const east = projectValley(longitude + degLon, latitude);
  const north = projectValley(longitude, latitude + miles / MILES_PER_DEG_LAT);
  if (!east || !north) return null;
  const rx = Math.hypot(east.x - center.x, east.y - center.y);
  const ry = Math.hypot(north.x - center.x, north.y - center.y);
  return { center, radius: (rx + ry) / 2 };
}

export const LISTING_MAP_RADIUS_MILES = 50;
