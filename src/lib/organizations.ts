/**
 * Partner and affiliation organizations shown with marks across the exchange.
 * Prefer official logos from /public/org-logos (see scripts/fetch-org-logos.mjs);
 * OrgMark falls back to compact text badges when a logo file is missing.
 */

export const ORGANIZATION_KINDS = [
  "membership",
  "extension",
  "federal",
  "education",
  "coop",
  "research",
] as const;

export type OrganizationKind = (typeof ORGANIZATION_KINDS)[number];

export type Organization = {
  slug: string;
  name: string;
  shortName: string;
  kind: OrganizationKind;
  blurb: string;
  websiteUrl: string;
  /** Compact mark label (2–4 chars). */
  mark: string;
  markColor: string;
  fieldColor: string;
};

export const ORGANIZATIONS = [
  {
    slug: "usda",
    name: "United States Department of Agriculture",
    shortName: "USDA",
    kind: "federal",
    blurb: "USDA National Organic Program and related farm programs.",
    websiteUrl: "https://www.usda.gov/",
    mark: "USDA",
    markColor: "oklch(0.38 0.08 145)",
    fieldColor: "oklch(0.94 0.03 145)",
  },
  {
    slug: "usda-nop",
    name: "USDA National Organic Program",
    shortName: "USDA Organic",
    kind: "federal",
    blurb: "Federal organic standards and accredited certifying agents.",
    websiteUrl: "https://www.ams.usda.gov/about-ams/programs-offices/national-organic-program",
    mark: "ORG",
    markColor: "oklch(0.4 0.1 140)",
    fieldColor: "oklch(0.95 0.03 140)",
  },
  {
    slug: "oeffa",
    name: "Ohio Ecological Food and Farm Association",
    shortName: "OEFFA",
    kind: "membership",
    blurb: "Ohio-based organic and ecological farming membership and education.",
    websiteUrl: "https://www.oeffa.org/",
    mark: "OEFFA",
    markColor: "oklch(0.4 0.1 155)",
    fieldColor: "oklch(0.94 0.035 155)",
  },
  {
    slug: "sare",
    name: "Sustainable Agriculture Research and Education",
    shortName: "SARE",
    kind: "research",
    blurb: "USDA-NIFA research and education grants for sustainable agriculture.",
    websiteUrl: "https://www.sare.org/",
    mark: "SARE",
    markColor: "oklch(0.42 0.09 85)",
    fieldColor: "oklch(0.95 0.03 90)",
  },
  {
    slug: "osu-extension",
    name: "Ohio State University Extension",
    shortName: "OSU Extension",
    kind: "extension",
    blurb: "County Extension educators and grazing, forage, and livestock programs in Ohio.",
    websiteUrl: "https://extension.osu.edu/",
    mark: "OSU",
    markColor: "oklch(0.4 0.12 30)",
    fieldColor: "oklch(0.95 0.03 40)",
  },
  {
    slug: "psu-extension",
    name: "Penn State Extension",
    shortName: "Penn State Ext.",
    kind: "extension",
    blurb: "Extension educators serving Pennsylvania farms and graziers.",
    websiteUrl: "https://extension.psu.edu/",
    mark: "PSU",
    markColor: "oklch(0.38 0.1 250)",
    fieldColor: "oklch(0.94 0.03 250)",
  },
  {
    slug: "uk-extension",
    name: "University of Kentucky Cooperative Extension",
    shortName: "UK Extension",
    kind: "extension",
    blurb: "County Extension serving Kentucky livestock and forage producers.",
    websiteUrl: "https://extension.ca.uky.edu/",
    mark: "UK",
    markColor: "oklch(0.4 0.12 25)",
    fieldColor: "oklch(0.95 0.03 35)",
  },
  {
    slug: "wvu-extension",
    name: "West Virginia University Extension",
    shortName: "WVU Extension",
    kind: "extension",
    blurb: "Extension educators serving West Virginia farms and land managers.",
    websiteUrl: "https://extension.wvu.edu/",
    mark: "WVU",
    markColor: "oklch(0.4 0.1 20)",
    fieldColor: "oklch(0.95 0.025 30)",
  },
  {
    slug: "stratford",
    name: "Stratford Ecological Center",
    shortName: "Stratford",
    kind: "education",
    blurb: "Organic educational farm and nature preserve in Delaware County, Ohio.",
    websiteUrl: "https://www.stratfordecologicalcenter.org/",
    mark: "SEC",
    markColor: "oklch(0.4 0.09 160)",
    fieldColor: "oklch(0.94 0.03 160)",
  },
  {
    slug: "organic-valley",
    name: "Organic Valley",
    shortName: "Organic Valley",
    kind: "coop",
    blurb: "Farmer-owned organic cooperative.",
    websiteUrl: "https://www.organicvalley.coop/",
    mark: "OV",
    markColor: "oklch(0.42 0.1 145)",
    fieldColor: "oklch(0.94 0.035 145)",
  },
  {
    slug: "farmers-union",
    name: "National Farmers Union",
    shortName: "NFU",
    kind: "membership",
    blurb: "Family farm advocacy and education.",
    websiteUrl: "https://nfu.org/",
    mark: "NFU",
    markColor: "oklch(0.4 0.08 230)",
    fieldColor: "oklch(0.94 0.025 230)",
  },
  {
    slug: "pco",
    name: "Pennsylvania Certified Organic",
    shortName: "PCO",
    kind: "membership",
    blurb: "USDA-accredited organic certifier based in Pennsylvania.",
    websiteUrl: "https://www.paorganic.org/",
    mark: "PCO",
    markColor: "oklch(0.4 0.09 130)",
    fieldColor: "oklch(0.94 0.03 130)",
  },
] as const satisfies readonly Organization[];

export type OrganizationSlug = (typeof ORGANIZATIONS)[number]["slug"];

const bySlug = new Map(ORGANIZATIONS.map((org) => [org.slug, org]));

export function isOrganizationSlug(value: string | null | undefined): value is OrganizationSlug {
  return !!value && bySlug.has(value as OrganizationSlug);
}

export function organizationBySlug(slug: string | null | undefined) {
  if (!slug) return null;
  return bySlug.get(slug as OrganizationSlug) ?? null;
}

/** Partner orgs members can tick on their profile (not co-ops, not certifiers). */
export const AFFILIATION_ORG_SLUGS = [
  "osu-extension",
  "psu-extension",
  "uk-extension",
  "wvu-extension",
  "stratford",
] as const satisfies readonly OrganizationSlug[];

export type AffiliationOrgSlug = (typeof AFFILIATION_ORG_SLUGS)[number];

export function isAffiliationOrgSlug(value: string): value is AffiliationOrgSlug {
  return (AFFILIATION_ORG_SLUGS as readonly string[]).includes(value);
}

export function parseAffiliationOrgs(values: readonly string[]) {
  return [
    ...new Set(values.filter(isAffiliationOrgSlug)),
  ] as AffiliationOrgSlug[];
}
