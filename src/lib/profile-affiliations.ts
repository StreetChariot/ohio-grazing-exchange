import type { AffiliationItem } from "@/components/affiliation-marks";
import type { Account } from "@/lib/auth";
import { certifierBySlug, isCertifierSlug } from "@/lib/certifiers";
import { COOPS, type CoopSlug } from "@/lib/coops";
import {
  isAffiliationOrgSlug,
  organizationBySlug,
  type AffiliationOrgSlug,
} from "@/lib/organizations";

export function parseAccreditationLines(value: string) {
  return [
    ...new Set(
      value
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2 && item.length <= 80),
    ),
  ].slice(0, 12);
}

export function formatAccreditations(values: string[]) {
  return values.join("\n");
}

export function roleSummary(account: Pick<Account, "offersLand" | "offersLivestock">) {
  const parts: string[] = [];
  if (account.offersLand) parts.push("offers forage");
  if (account.offersLivestock) parts.push("has livestock");
  return parts.length ? parts.join(" · ") : "Roles not set yet";
}

export function affiliationItems(
  account: Pick<
    Account,
    | "memberOeffa"
    | "memberSare"
    | "oeffaCertified"
    | "otherCertified"
    | "otherCertificationNotes"
    | "organicCertified"
    | "organicCertifier"
    | "affiliationOrgs"
    | "accreditations"
    | "coops"
  >,
): AffiliationItem[] {
  const items: AffiliationItem[] = [];

  if (account.memberOeffa) {
    items.push({
      key: "member-oeffa",
      label: "OEFFA member",
      orgSlug: "oeffa",
    });
  }
  if (account.memberSare) {
    items.push({
      key: "member-sare",
      label: "SARE",
      orgSlug: "sare",
    });
  }
  for (const slug of account.affiliationOrgs) {
    const org = organizationBySlug(slug);
    if (!org) continue;
    items.push({
      key: `aff-${slug}`,
      label: org.shortName,
      orgSlug: slug,
    });
  }
  if (account.oeffaCertified || account.organicCertifier === "oeffa") {
    items.push({
      key: "cert-oeffa",
      label: "OEFFA certified",
      certifierSlug: "oeffa",
      orgSlug: "oeffa",
    });
  }
  if (account.organicCertified) {
    items.push({
      key: "usda-organic",
      label: "USDA organic",
      orgSlug: "usda-nop",
    });
    if (
      account.organicCertifier &&
      account.organicCertifier !== "oeffa" &&
      isCertifierSlug(account.organicCertifier)
    ) {
      const certifier = certifierBySlug(account.organicCertifier);
      if (certifier) {
        items.push({
          key: `cert-${certifier.slug}`,
          label: `Certified by ${certifier.shortName}`,
          certifierSlug: account.organicCertifier,
        });
      }
    }
  }
  if (account.otherCertified) {
    items.push({
      key: "other-certified",
      label: account.otherCertificationNotes
        ? `Other certified: ${account.otherCertificationNotes}`
        : "Other certified",
    });
  }
  for (const item of account.accreditations) {
    items.push({ key: `acc-${item}`, label: item });
  }
  for (const coop of account.coops) {
    const orgSlug =
      coop.slug === "organic-valley"
        ? ("organic-valley" as const)
        : coop.slug === "farmers-union"
          ? ("farmers-union" as const)
          : coop.slug === "oeffa-growers"
            ? ("oeffa" as const)
            : undefined;
    items.push({
      key: `coop-${coop.slug}`,
      label: coop.role === "org" ? `${coop.name} (co-op)` : coop.name,
      orgSlug,
      href: `/forum/${coop.boardSlug}`,
    });
  }

  return items;
}

/** @deprecated Prefer affiliationItems for logo-aware display. */
export function affiliationChips(
  account: Parameters<typeof affiliationItems>[0],
) {
  return affiliationItems(account).map((item) => item.label);
}

export function selectedCoopSet(slugs: readonly string[]) {
  return new Set(slugs.filter(isKnownCoop));
}

export function selectedAffiliationOrgSet(slugs: readonly string[]) {
  return new Set(slugs.filter(isAffiliationOrgSlug));
}

function isKnownCoop(value: string): value is CoopSlug {
  return COOPS.some((coop) => coop.slug === value);
}

export function parseAffiliationOrgForm(values: readonly string[]): AffiliationOrgSlug[] {
  return [...new Set(values.filter(isAffiliationOrgSlug))];
}
