export const COOPS = [
  {
    slug: "organic-valley",
    name: "Organic Valley",
    description:
      "Farmer-owned organic cooperative. Member and co-op staff channels stay private to this lane.",
    boardSlug: "coop-organic-valley",
  },
  {
    slug: "farmers-union",
    name: "National Farmers Union",
    description: "Family farm advocacy and education.",
    boardSlug: "coop-farmers-union",
  },
  {
    slug: "oeffa-growers",
    name: "OEFFA growers circle",
    description: "Private lane for OEFFA-affiliated members in the Valley.",
    boardSlug: "coop-oeffa-growers",
  },
] as const;

export type CoopSlug = (typeof COOPS)[number]["slug"];
export type CoopMembershipRole = "member" | "org";

export type CoopMembership = {
  slug: CoopSlug;
  name: string;
  role: CoopMembershipRole;
  boardSlug: string;
};

export function isCoopSlug(value: string | null | undefined): value is CoopSlug {
  return !!value && COOPS.some((coop) => coop.slug === value);
}

export function coopBySlug(slug: string | null | undefined) {
  return COOPS.find((coop) => coop.slug === slug) ?? null;
}

export function boardSlugForCoop(slug: CoopSlug) {
  return coopBySlug(slug)?.boardSlug ?? null;
}
