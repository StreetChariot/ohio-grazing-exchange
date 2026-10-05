/**
 * USDA NOP accredited certifying agents commonly active for operations in
 * Ohio, Pennsylvania, Kentucky, and West Virginia.
 *
 * Source of truth for the full national list:
 * https://organic.ams.usda.gov/integrity/Certifiers
 * https://www.ams.usda.gov/services/organic-certification/certifying-agents
 *
 * Most NOP agents may certify anywhere; this catalog prioritizes agents with
 * known regional presence or frequent use in the Valley states.
 */

import type { ServiceState } from "./region";

export type Certifier = {
  slug: string;
  name: string;
  shortName: string;
  acronym: string;
  /** Integrity / AMS agent id when known. */
  agentId: string | null;
  websiteUrl: string;
  /** States in our service area where this agent is known to certify. */
  valleyStates: ServiceState[];
  /** Prefer in the certifier picker for Valley members. */
  regional: boolean;
  markColor: string;
  fieldColor: string;
};

export const CERTIFIERS = [
  {
    slug: "oeffa",
    name: "Ohio Ecological Food and Farm Association",
    shortName: "OEFFA Certification",
    acronym: "OEFFA",
    agentId: "160",
    websiteUrl: "https://certification.oeffa.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: true,
    markColor: "oklch(0.4 0.1 155)",
    fieldColor: "oklch(0.94 0.035 155)",
  },
  {
    slug: "pco",
    name: "Pennsylvania Certified Organic",
    shortName: "PCO",
    acronym: "PCO",
    agentId: "821",
    websiteUrl: "https://www.paorganic.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: true,
    markColor: "oklch(0.4 0.09 130)",
    fieldColor: "oklch(0.94 0.03 130)",
  },
  {
    slug: "kda",
    name: "Kentucky Department of Agriculture",
    shortName: "KDA Organic",
    acronym: "KDA",
    agentId: "540",
    websiteUrl: "https://www.kyagr.com/",
    valleyStates: ["Kentucky"],
    regional: true,
    markColor: "oklch(0.4 0.1 70)",
    fieldColor: "oklch(0.95 0.03 75)",
  },
  {
    slug: "mosa",
    name: "Midwest Organic Services Association",
    shortName: "MOSA",
    acronym: "MOSA",
    agentId: "995",
    websiteUrl: "https://mosaorganic.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: true,
    markColor: "oklch(0.42 0.09 145)",
    fieldColor: "oklch(0.94 0.03 145)",
  },
  {
    slug: "ocia",
    name: "Organic Crop Improvement Association",
    shortName: "OCIA",
    acronym: "OCIA",
    agentId: "883",
    websiteUrl: "https://www.ocia.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: true,
    markColor: "oklch(0.4 0.08 160)",
    fieldColor: "oklch(0.94 0.03 160)",
  },
  {
    slug: "nofa-ny",
    name: "Northeast Organic Farming Association of New York",
    shortName: "NOFA-NY",
    acronym: "NOFA-NY",
    agentId: "325",
    websiteUrl: "https://www.nofany.org/",
    valleyStates: ["Pennsylvania", "Ohio"],
    regional: true,
    markColor: "oklch(0.4 0.09 140)",
    fieldColor: "oklch(0.94 0.03 140)",
  },
  {
    slug: "otco",
    name: "Oregon Tilth Certified Organic",
    shortName: "Oregon Tilth",
    acronym: "OTCO",
    agentId: "815",
    websiteUrl: "https://tilth.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.09 150)",
    fieldColor: "oklch(0.94 0.03 150)",
  },
  {
    slug: "qcs",
    name: "Quality Certification Services",
    shortName: "QCS",
    acronym: "QCS",
    agentId: "587",
    websiteUrl: "https://www.qcsinfo.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.08 220)",
    fieldColor: "oklch(0.94 0.025 220)",
  },
  {
    slug: "qai",
    name: "Quality Assurance International",
    shortName: "QAI",
    acronym: "QAI",
    agentId: "552",
    websiteUrl: "https://www.qai-inc.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.08 240)",
    fieldColor: "oklch(0.94 0.025 240)",
  },
  {
    slug: "onecert",
    name: "OneCert",
    shortName: "OneCert",
    acronym: "ONE",
    agentId: "258",
    websiteUrl: "https://www.onecert.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.42 0.08 200)",
    fieldColor: "oklch(0.94 0.025 200)",
  },
  {
    slug: "nics",
    name: "Nature's International Certification Services",
    shortName: "NICS",
    acronym: "NICS",
    agentId: "843",
    websiteUrl: "https://www.naturesinternational.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.09 125)",
    fieldColor: "oklch(0.94 0.03 125)",
  },
  {
    slug: "stellar",
    name: "Stellar Certification Services",
    shortName: "Stellar",
    acronym: "STEL",
    agentId: "777",
    websiteUrl: "https://www.stellarcertification.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.08 280)",
    fieldColor: "oklch(0.94 0.025 280)",
  },
  {
    slug: "scs",
    name: "SCS Global Services",
    shortName: "SCS",
    acronym: "SCS",
    agentId: "535",
    websiteUrl: "https://www.scsglobalservices.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.07 210)",
    fieldColor: "oklch(0.94 0.02 210)",
  },
  {
    slug: "organic-certifiers",
    name: "Organic Certifiers",
    shortName: "Organic Certifiers",
    acronym: "OC",
    agentId: "622",
    websiteUrl: "https://www.organiccertifiers.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.08 135)",
    fieldColor: "oklch(0.94 0.03 135)",
  },
  {
    slug: "mda",
    name: "Maryland Department of Agriculture",
    shortName: "MDA Organic",
    acronym: "MDA",
    agentId: "678",
    websiteUrl: "https://mda.maryland.gov/",
    valleyStates: ["Pennsylvania", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.08 250)",
    fieldColor: "oklch(0.94 0.025 250)",
  },
  {
    slug: "vof",
    name: "Vermont Organic Farmers",
    shortName: "VOF",
    acronym: "VOF",
    agentId: "42",
    websiteUrl: "https://vermontorganic.org/",
    valleyStates: ["Pennsylvania", "Ohio"],
    regional: false,
    markColor: "oklch(0.4 0.09 150)",
    fieldColor: "oklch(0.94 0.03 150)",
  },
  {
    slug: "mofga",
    name: "MOFGA Certification Services",
    shortName: "MOFGA",
    acronym: "MCS",
    agentId: "714",
    websiteUrl: "https://www.mofga.org/",
    valleyStates: ["Pennsylvania", "Ohio"],
    regional: false,
    markColor: "oklch(0.4 0.09 145)",
    fieldColor: "oklch(0.94 0.03 145)",
  },
  {
    slug: "ccof",
    name: "CCOF Certification Services",
    shortName: "CCOF",
    acronym: "CCOF",
    agentId: "12",
    websiteUrl: "https://www.ccof.org/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.09 140)",
    fieldColor: "oklch(0.94 0.03 140)",
  },
  {
    slug: "americert",
    name: "Americert International",
    shortName: "Americert",
    acronym: "AI",
    agentId: null,
    websiteUrl: "https://www.americertorganic.com/",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.4 0.07 230)",
    fieldColor: "oklch(0.94 0.02 230)",
  },
  {
    slug: "other",
    name: "Other USDA-accredited certifier",
    shortName: "Other NOP certifier",
    acronym: "NOP",
    agentId: null,
    websiteUrl: "https://organic.ams.usda.gov/integrity/Certifiers",
    valleyStates: ["Ohio", "Pennsylvania", "Kentucky", "West Virginia"],
    regional: false,
    markColor: "oklch(0.42 0.06 140)",
    fieldColor: "oklch(0.94 0.02 140)",
  },
] as const;

export type CertifierSlug = (typeof CERTIFIERS)[number]["slug"];

const CERTIFIER_LIST: Certifier[] = CERTIFIERS.map((certifier) => ({
  ...certifier,
  valleyStates: [...certifier.valleyStates] as ServiceState[],
}));

const bySlug = new Map(CERTIFIER_LIST.map((certifier) => [certifier.slug, certifier]));

export function isCertifierSlug(value: string | null | undefined): value is CertifierSlug {
  return !!value && bySlug.has(value as CertifierSlug);
}

export function certifierBySlug(slug: string | null | undefined) {
  if (!slug) return null;
  return bySlug.get(slug as CertifierSlug) ?? null;
}

export function certifiersForState(state: ServiceState | null | undefined) {
  if (!state) {
    return [...CERTIFIER_LIST].sort(compareCertifiers);
  }
  return CERTIFIER_LIST.filter((certifier) => certifier.valleyStates.includes(state)).sort(
    compareCertifiers,
  );
}

function compareCertifiers(a: Certifier, b: Certifier) {
  if (a.regional !== b.regional) return a.regional ? -1 : 1;
  if (a.slug === "other") return 1;
  if (b.slug === "other") return -1;
  return a.shortName.localeCompare(b.shortName);
}

export const INTEGRITY_CERTIFIER_LOCATOR =
  "https://organic.ams.usda.gov/integrity/Certifiers";
