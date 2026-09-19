import type { Metadata } from "next";
import { BrowseListings } from "@/components/browse-listings";
import { parseFilters } from "@/lib/filters";
import { listListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse listings",
  description:
    "Search land and livestock grazing listings in the Ohio Valley by state, county, animal, and season.",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.error === "1") {
    throw new Error("Listings could not be loaded.");
  }

  const listings = await listListings();
  return <BrowseListings listings={listings} initialFilters={parseFilters(params)} />;
}
