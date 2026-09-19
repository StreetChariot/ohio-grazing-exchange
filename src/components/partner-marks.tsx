import Link from "next/link";
import { OrgMark } from "@/components/org-mark";
import {
  CERTIFIERS,
  INTEGRITY_CERTIFIER_LOCATOR,
  isCertifierSlug,
  type CertifierSlug,
} from "@/lib/certifiers";
import { ORGANIZATIONS, type OrganizationSlug } from "@/lib/organizations";
import { cn } from "@/lib/utils";

const PARTNER_SLUGS: OrganizationSlug[] = [
  "usda",
  "usda-nop",
  "oeffa",
  "sare",
  "osu-extension",
  "psu-extension",
  "uk-extension",
  "wvu-extension",
  "stratford",
  "pco",
];

export function PartnerMarksStrip({
  className,
  heading = "Valley partners",
  showCertifiers = false,
}: {
  className?: string;
  heading?: string;
  showCertifiers?: boolean;
}) {
  const partners = PARTNER_SLUGS.map((slug) =>
    ORGANIZATIONS.find((org) => org.slug === slug),
  ).filter(Boolean);

  const regionalCertifiers = CERTIFIERS.filter((certifier) => certifier.regional);

  return (
    <section className={cn("grid gap-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
        <Link
          href="/partners"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          All partners and certifiers
        </Link>
      </div>
      <ul className="flex flex-wrap gap-3">
        {partners.map((org) =>
          org ? (
            <li key={org.slug}>
              <Link
                href={org.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-[var(--map-paper)]/40 px-2 py-1.5 transition-opacity hover:opacity-90"
                title={org.name}
              >
                <OrgMark org={org.slug} />
                <span className="text-sm font-medium">{org.shortName}</span>
              </Link>
            </li>
          ) : null,
        )}
      </ul>
      {showCertifiers ? (
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Regional USDA-accredited organic certifiers. Full national list:{" "}
            <a
              href={INTEGRITY_CERTIFIER_LOCATOR}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Organic INTEGRITY
            </a>
            .
          </p>
          <ul className="flex flex-wrap gap-2">
            {regionalCertifiers.map((certifier) => (
              <li key={certifier.slug}>
                <Link
                  href={certifier.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-border/70 px-2 py-1.5 text-sm"
                >
                  <OrgMark certifier={certifier.slug as CertifierSlug} />
                  {certifier.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function OrganicListingMarks({
  organicCertified,
  organicCertifier,
  label,
}: {
  organicCertified: boolean;
  organicCertifier: string | null;
  label: string;
}) {
  if (!organicCertified) return null;
  const certifierSlug = isCertifierSlug(organicCertifier) ? organicCertifier : null;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-[var(--map-paper)]/50 px-2 py-1">
        <OrgMark org="usda-nop" size="sm" />
        <span className="text-xs font-medium sm:text-sm">{label}</span>
      </span>
      {certifierSlug ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 px-2 py-1">
          <OrgMark certifier={certifierSlug} size="sm" />
          <span className="text-xs font-medium sm:text-sm">
            {CERTIFIERS.find((c) => c.slug === certifierSlug)?.shortName ?? "Certifier"}
          </span>
        </span>
      ) : null}
    </span>
  );
}
