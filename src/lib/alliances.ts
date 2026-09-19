import { countyCentroid } from "./counties";
import { isServiceState, type ServiceState } from "./region";
import type { Listing } from "./types";

export const ALLIANCE_SLUGS = [
  "northwest",
  "northeast",
  "southwest",
  "southeast",
] as const;

export type AllianceSlug = (typeof ALLIANCE_SLUGS)[number];

export type Alliance = {
  slug: AllianceSlug;
  name: string;
  compass: string;
  summary: string;
  coverage: string;
};

/** Compass split of the four-state valley. North of 39.75°, west of 82.35°W. */
const LAT_SPLIT = 39.75;
const LON_SPLIT = -82.35;

const WV_NORTHEAST_COUNTIES = new Set([
  "Hancock",
  "Brooke",
  "Ohio",
  "Marshall",
]);

export const ALLIANCES: Record<AllianceSlug, Alliance> = {
  northwest: {
    slug: "northwest",
    name: "Northwest Alliance",
    compass: "NW",
    summary:
      "Western Lake Erie and the till-plain counties of Ohio. Toledo, Lima, Findlay, and the Indiana line.",
    coverage: "Northern and western Ohio",
  },
  northeast: {
    slug: "northeast",
    name: "Northeast Alliance",
    compass: "NE",
    summary:
      "Pennsylvania, northeastern Ohio, and the northern panhandle. Cleveland, Youngstown, Erie, Pittsburgh, Wheeling.",
    coverage: "Pennsylvania, NE Ohio, northern panhandle",
  },
  southwest: {
    slug: "southwest",
    name: "Southwest Alliance",
    compass: "SW",
    summary:
      "Kentucky and the Cincinnati–Dayton side of Ohio. Bluegrass, river bottoms, and the counties that look toward Louisville.",
    coverage: "Kentucky and SW Ohio",
  },
  southeast: {
    slug: "southeast",
    name: "Southeast Alliance",
    compass: "SE",
    summary:
      "West Virginia and Appalachian Ohio. Hills and river counties from Athens and Marietta through Charleston and Huntington.",
    coverage: "West Virginia and SE Ohio",
  },
};

export const ALLIANCE_LIST = ALLIANCE_SLUGS.map((slug) => ALLIANCES[slug]);

export function isAllianceSlug(value: string | null | undefined): value is AllianceSlug {
  return !!value && (ALLIANCE_SLUGS as readonly string[]).includes(value);
}

export function allianceBySlug(slug: string | null | undefined) {
  if (!isAllianceSlug(slug)) return null;
  return ALLIANCES[slug];
}

export function allianceForPoint(latitude: number, longitude: number): AllianceSlug {
  const north = latitude > LAT_SPLIT;
  const west = longitude <= LON_SPLIT;
  if (north && west) return "northwest";
  if (north && !west) return "northeast";
  if (!north && west) return "southwest";
  return "southeast";
}

export function allianceForPlace(
  state: string | null | undefined,
  county: string | null | undefined,
): AllianceSlug | null {
  if (!isServiceState(state) || !county) return null;

  if (state === "Pennsylvania") return "northeast";
  if (state === "Kentucky") return "southwest";
  if (state === "West Virginia") {
    return WV_NORTHEAST_COUNTIES.has(county) ? "northeast" : "southeast";
  }

  const centroid = countyCentroid(county);
  if (centroid) return allianceForPoint(centroid.latitude, centroid.longitude);
  return "northwest";
}

export function allianceForListing(listing: Pick<Listing, "latitude" | "longitude" | "state" | "county">) {
  if (Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude)) {
    return allianceForPoint(listing.latitude, listing.longitude);
  }
  return allianceForPlace(listing.state, listing.county) ?? "northwest";
}

export function placeLabel(state: ServiceState | null, county: string | null) {
  if (state && county) return `${county} County, ${state}`;
  if (state) return state;
  return null;
}
