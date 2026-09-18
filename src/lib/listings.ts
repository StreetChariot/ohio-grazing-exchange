import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { countyCentroid } from "./counties";
import { matchesListing } from "./filters";
import { sampleListings } from "./sample-listings";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Listing, ListingFilters, ListingInput } from "./types";

const postedFile = path.join(process.cwd(), "data", "posted-listings.json");

type ListingRow = {
  id: string;
  side: Listing["side"];
  title: string;
  county: string;
  nearest_town: string;
  latitude: number;
  longitude: number;
  land_type: Listing["landType"];
  livestock_type: Listing["livestockType"];
  seasons: Listing["seasons"];
  available_from: string;
  available_until: string;
  acres: number | null;
  head_count: number | null;
  travel_radius_miles: number | null;
  fencing: Listing["fencing"];
  water_available: boolean | null;
  rate_notes: string | null;
  description: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  created_at: string;
};

function fromRow(row: ListingRow): Listing {
  return {
    id: row.id,
    side: row.side,
    title: row.title,
    county: row.county,
    nearestTown: row.nearest_town,
    latitude: row.latitude,
    longitude: row.longitude,
    landType: row.land_type,
    livestockType: row.livestock_type,
    seasons: row.seasons,
    availableFrom: row.available_from.slice(0, 10),
    availableUntil: row.available_until.slice(0, 10),
    acres: row.acres,
    headCount: row.head_count,
    travelRadiusMiles: row.travel_radius_miles,
    fencing: row.fencing,
    waterAvailable: row.water_available,
    rateNotes: row.rate_notes,
    description: row.description,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    createdAt: row.created_at,
  };
}

function toInsert(listing: Listing) {
  return {
    id: listing.id,
    side: listing.side,
    title: listing.title,
    county: listing.county,
    nearest_town: listing.nearestTown,
    latitude: listing.latitude,
    longitude: listing.longitude,
    land_type: listing.landType,
    livestock_type: listing.livestockType,
    seasons: listing.seasons,
    available_from: listing.availableFrom,
    available_until: listing.availableUntil,
    acres: listing.acres,
    head_count: listing.headCount,
    travel_radius_miles: listing.travelRadiusMiles,
    fencing: listing.fencing,
    water_available: listing.waterAvailable,
    rate_notes: listing.rateNotes,
    description: listing.description,
    contact_name: listing.contactName,
    contact_email: listing.contactEmail,
    contact_phone: listing.contactPhone,
  };
}

async function readPosted(): Promise<Listing[]> {
  try {
    const raw = await readFile(postedFile, "utf8");
    const parsed = JSON.parse(raw) as Listing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writePosted(listings: Listing[]) {
  await mkdir(path.dirname(postedFile), { recursive: true });
  await writeFile(postedFile, JSON.stringify(listings, null, 2));
}

function sortNewest(listings: Listing[]) {
  return [...listings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function localListings() {
  const posted = await readPosted();
  const ids = new Set(posted.map((listing) => listing.id));
  return sortNewest([
    ...posted,
    ...sampleListings.filter((listing) => !ids.has(listing.id)),
  ]);
}

export async function listListings(filters: ListingFilters = {}) {
  if (!isSupabaseConfigured()) {
    const listings = await localListings();
    return listings.filter((listing) => matchesListing(listing, filters));
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is configured but the client could not start.");
  }

  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (filters.side) query = query.eq("side", filters.side);
  if (filters.county) query = query.eq("county", filters.county);
  if (filters.livestockType) query = query.eq("livestock_type", filters.livestockType);
  if (filters.landType) query = query.eq("land_type", filters.landType);
  if (filters.season) query = query.contains("seasons", [filters.season]);
  if (filters.onDate) {
    query = query.lte("available_from", filters.onDate).gte("available_until", filters.onDate);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return (data as ListingRow[]).map(fromRow);
}

export async function getListing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  if (!isSupabaseConfigured()) {
    const listings = await localListings();
    return listings.find((listing) => listing.id === id) ?? null;
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is configured but the client could not start.");
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? fromRow(data as ListingRow) : null;
}

export async function createListing(input: ListingInput) {
  const county = countyCentroid(input.county);
  if (!county) {
    throw new Error("Choose an Ohio county.");
  }

  const listing: Listing = {
    ...input,
    id: randomUUID(),
    latitude: county.latitude,
    longitude: county.longitude,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const posted = await readPosted();
    await writePosted([listing, ...posted]);
    return listing;
  }

  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is configured but the client could not start.");
  }

  const { data, error } = await supabase
    .from("listings")
    .insert(toInsert(listing))
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return fromRow(data as ListingRow);
}
