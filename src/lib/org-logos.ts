/**
 * Official partner / certifier logos under /public/org-logos.
 * Display sizes: sm=28px, md=36px, lg=64px (2x assets in sm/md/lg folders).
 */

export const ORG_LOGO_SIZES = {
  sm: { px: 28, folder: "sm" },
  md: { px: 36, folder: "md" },
  lg: { px: 64, folder: "lg" },
} as const;

export type OrgLogoSize = keyof typeof ORG_LOGO_SIZES;

/** Slugs with a normalized PNG in public/org-logos/{sm,md,lg}/. */
export const ORG_LOGO_SLUGS = [
  "usda",
  "usda-nop",
  "oeffa",
  "sare",
  "osu-extension",
  "psu-extension",
  "uk-extension",
  "wvu-extension",
  "stratford",
  "organic-valley",
  "farmers-union",
  "pco",
  "kda",
  "mosa",
  "ocia",
  "nofa-ny",
  "otco",
  "qcs",
  "qai",
  "onecert",
  "nics",
  "scs",
  "organic-certifiers",
  "mda",
  "vof",
  "mofga",
  "ccof",
] as const;

export type OrgLogoSlug = (typeof ORG_LOGO_SLUGS)[number];

const logoSet = new Set<string>(ORG_LOGO_SLUGS);

export function hasOrgLogo(slug: string | null | undefined): slug is OrgLogoSlug {
  return !!slug && logoSet.has(slug);
}

export function orgLogoSrc(slug: string, size: OrgLogoSize = "md") {
  if (!hasOrgLogo(slug)) return null;
  return `/org-logos/${ORG_LOGO_SIZES[size].folder}/${slug}.png`;
}
