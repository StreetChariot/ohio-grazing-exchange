import type { AllianceSlug } from "./alliances";

export type AllianceBrand = {
  slug: AllianceSlug;
  markColor: string;
  fieldColor: string;
  accentColor: string;
  wordmark: string;
};

export const ALLIANCE_BRANDS: Record<AllianceSlug, AllianceBrand> = {
  northwest: {
    slug: "northwest",
    markColor: "oklch(0.42 0.11 152)",
    fieldColor: "oklch(0.94 0.03 150)",
    accentColor: "oklch(0.55 0.08 230)",
    wordmark: "Northwest",
  },
  northeast: {
    slug: "northeast",
    markColor: "oklch(0.4 0.1 145)",
    fieldColor: "oklch(0.94 0.025 95)",
    accentColor: "oklch(0.5 0.09 40)",
    wordmark: "Northeast",
  },
  southwest: {
    slug: "southwest",
    markColor: "oklch(0.4 0.1 165)",
    fieldColor: "oklch(0.94 0.03 165)",
    accentColor: "oklch(0.48 0.08 70)",
    wordmark: "Southwest",
  },
  southeast: {
    slug: "southeast",
    markColor: "oklch(0.38 0.09 140)",
    fieldColor: "oklch(0.94 0.025 75)",
    accentColor: "oklch(0.45 0.08 40)",
    wordmark: "Southeast",
  },
};

export function allianceBrand(slug: AllianceSlug) {
  return ALLIANCE_BRANDS[slug];
}
