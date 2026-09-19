import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { countyCentroid } from "./counties";
import { matchesListing } from "./filters";
import { isServiceState } from "./region";
import { sampleListings } from "./sample-listings";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import type { Listing, ListingFilters, ListingInput } from "./types";

const postedFile = path.join(process.cwd(), "data", "posted-listings.json");

type ListingRow = {
  id: string;
  side: Listing["side"];
  title: string;
  state?: string;
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
  owner_id?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at: string;
};

type ContactRow = {
  listing_id: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
};

function fromRow(row: ListingRow, contact?: ContactRow | null): Listing {
  return {
    id: row.id,
    side: row.side,
    title: row.title,
    state: isServiceState(row.state) ? row.state : "Ohio",
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
    ownerId: row.owner_id ?? null,
    contactName: contact?.contact_name ?? row.contact_name ?? null,
    contactEmail: contact?.contact_email ?? row.contact_email ?? null,
    contactPhone: contact?.contact_phone ?? row.contact_phone ?? null,
    createdAt: row.created_at,
  };
}

function toInsert(listing: Listing) {
  return {
    id: listing.id,
    side: listing.side,
    title: listing.title,
    state: listing.state,
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
    owner_id: listing.ownerId,
  };
}

async function readPosted(): Promise<Listing[]> {
  try {
    const raw = await readFile(postedFile, "utf8");
    const parsed = JSON.parse(raw) as Listing[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((listing) => ({
      ...listing,
      state: isServiceState(listing.state) ? listing.state : "Ohio",
      ownerId: listing.ownerId ?? null,
    }));
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

  const supabase = await createClient();
  let query = supabase.from("listings").select("*").order("created_at", { ascending: false });
  if (filters.side) query = query.eq("side", filters.side);
  if (filters.state) query = query.eq("state", filters.state);
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
  return (data as ListingRow[]).map((row) => fromRow(row));
}

export async function getListing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  if (!isSupabaseConfigured()) {
    const listings = await localListings();
    return listings.find((listing) => listing.id === id) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: contact } = await supabase
    .from("listing_contacts")
    .select("*")
    .eq("listing_id", id)
    .maybeSingle();

  return fromRow(data as ListingRow, (contact as ContactRow | null) ?? null);
}

export async function listOwnedListings(ownerId: string) {
  if (!isSupabaseConfigured()) {
    const listings = await localListings();
    return listings.filter((listing) => listing.ownerId === ownerId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ListingRow[]).map((row) => fromRow(row));
}

export async function listProfiles() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createListing(input: ListingInput, ownerId: string | null) {
  const county = countyCentroid(input.county);
  if (!county) {
    throw new Error("Choose a county.");
  }

  const listing: Listing = {
    ...input,
    state: input.state ?? "Ohio",
    id: randomUUID(),
    latitude: county.latitude,
    longitude: county.longitude,
    ownerId,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const posted = await readPosted();
    await writePosted([listing, ...posted]);
    return listing;
  }

  if (!ownerId) {
    throw new Error("Sign in to post a listing.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert(toInsert(listing))
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const { error: contactError } = await supabase.from("listing_contacts").insert({
    listing_id: listing.id,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    contact_phone: input.contactPhone,
  });

  if (contactError) {
    await supabase.from("listings").delete().eq("id", listing.id);
    throw new Error(contactError.message);
  }

  return fromRow(data as ListingRow, {
    listing_id: listing.id,
    contact_name: input.contactName ?? "",
    contact_email: input.contactEmail ?? "",
    contact_phone: input.contactPhone,
  });
}

export async function deleteListing(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new Error("That listing could not be found.");
  }

  if (!isSupabaseConfigured()) {
    const posted = await readPosted();
    await writePosted(posted.filter((listing) => listing.id !== id));
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
