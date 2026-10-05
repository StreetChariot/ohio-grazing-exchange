import type { AllianceSlug } from "@/lib/alliances";
import { allianceBrand } from "@/lib/alliance-brand";
import { cn } from "@/lib/utils";

const COMPASS: Record<AllianceSlug, string> = {
  northwest: "M18 18 L32 18 L32 32",
  northeast: "M46 18 L32 18 L32 32",
  southwest: "M18 46 L32 46 L32 32",
  southeast: "M46 46 L32 46 L32 32",
};

export function AllianceMark({
  slug,
  className,
  title,
}: {
  slug: AllianceSlug;
  className?: string;
  title?: string;
}) {
  const brand = allianceBrand(slug);
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title ?? brand.wordmark}
      className={cn("size-14 shrink-0", className)}
    >
      <rect width="64" height="64" rx="14" fill={brand.fieldColor} />
      <circle cx="32" cy="32" r="22" fill="none" stroke={brand.markColor} strokeWidth="3" />
      <path
        d={COMPASS[slug]}
        fill="none"
        stroke={brand.accentColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="4.5" fill={brand.markColor} />
      <text
        x="32"
        y="58"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill={brand.markColor}
        letterSpacing="0.08em"
      >
        {brand.slug === "northwest"
          ? "NW"
          : brand.slug === "northeast"
            ? "NE"
            : brand.slug === "southwest"
              ? "SW"
              : "SE"}
      </text>
    </svg>
  );
}
