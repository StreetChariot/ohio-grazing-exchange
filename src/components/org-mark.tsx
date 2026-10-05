import Image from "next/image";
import type { CertifierSlug } from "@/lib/certifiers";
import { certifierBySlug } from "@/lib/certifiers";
import {
  ORG_LOGO_SIZES,
  orgLogoSrc,
  type OrgLogoSize,
} from "@/lib/org-logos";
import type { OrganizationSlug } from "@/lib/organizations";
import { organizationBySlug } from "@/lib/organizations";
import { cn } from "@/lib/utils";

type MarkSource =
  | { kind: "org"; slug: OrganizationSlug }
  | { kind: "certifier"; slug: CertifierSlug };

function resolve(source: MarkSource) {
  if (source.kind === "org") {
    const org = organizationBySlug(source.slug);
    if (!org) return null;
    return {
      slug: source.slug as string,
      label: org.shortName,
      mark: org.mark,
      markColor: org.markColor,
      fieldColor: org.fieldColor,
    };
  }
  const certifier = certifierBySlug(source.slug);
  if (!certifier) return null;
  return {
    slug: source.slug as string,
    label: certifier.shortName,
    mark: certifier.acronym.length > 5 ? certifier.acronym.slice(0, 4) : certifier.acronym,
    markColor: certifier.markColor,
    fieldColor: certifier.fieldColor,
  };
}

function TextMarkFallback({
  label,
  mark,
  markColor,
  fieldColor,
  size,
}: {
  label: string;
  mark: string;
  markColor: string;
  fieldColor: string;
  size: OrgLogoSize;
}) {
  const px = ORG_LOGO_SIZES[size].px;
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={label}
      width={px}
      height={px}
      className="shrink-0"
    >
      <rect width="64" height="64" rx="12" fill={fieldColor} />
      <rect
        x="6"
        y="6"
        width="52"
        height="52"
        rx="9"
        fill="none"
        stroke={markColor}
        strokeWidth="2.5"
      />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize={mark.length > 4 ? 11 : mark.length > 3 ? 13 : 16}
        fontWeight="700"
        fill={markColor}
        letterSpacing="0.04em"
      >
        {mark}
      </text>
    </svg>
  );
}

export function OrgMark({
  org,
  certifier,
  className,
  title,
  showLabel = false,
  size = "md",
}: {
  org?: OrganizationSlug;
  certifier?: CertifierSlug;
  className?: string;
  title?: string;
  showLabel?: boolean;
  /** sm=28px, md=36px, lg=64px — matches public/org-logos/{sm,md,lg}. */
  size?: OrgLogoSize;
}) {
  const source: MarkSource | null = org
    ? { kind: "org", slug: org }
    : certifier
      ? { kind: "certifier", slug: certifier }
      : null;
  if (!source) return null;
  const brand = resolve(source);
  if (!brand) return null;

  const label = title ?? brand.label;
  const logoSrc = orgLogoSrc(brand.slug, size);
  const px = ORG_LOGO_SIZES[size].px;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {logoSrc ? (
        <span
          className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-border/60"
          style={{ width: px, height: px }}
        >
          <Image
            src={logoSrc}
            alt={label}
            width={px}
            height={px}
            className="size-full object-contain p-0.5"
            unoptimized
          />
        </span>
      ) : (
        <TextMarkFallback
          label={label}
          mark={brand.mark}
          markColor={brand.markColor}
          fieldColor={brand.fieldColor}
          size={size}
        />
      )}
      {showLabel ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
    </span>
  );
}
