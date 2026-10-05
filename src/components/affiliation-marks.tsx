import Link from "next/link";
import { OrgMark } from "@/components/org-mark";
import type { CertifierSlug } from "@/lib/certifiers";
import { certifierBySlug } from "@/lib/certifiers";
import type { OrganizationSlug } from "@/lib/organizations";
import { organizationBySlug } from "@/lib/organizations";
import { cn } from "@/lib/utils";

export type AffiliationItem = {
  key: string;
  label: string;
  orgSlug?: OrganizationSlug;
  certifierSlug?: CertifierSlug;
  href?: string;
};

export function AffiliationMarks({
  items,
  empty = "No memberships, certifications, or co-ops listed yet.",
  size = "md",
}: {
  items: AffiliationItem[];
  empty?: string;
  size?: "sm" | "md";
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className={cn("flex flex-wrap", size === "sm" ? "gap-2" : "gap-3")}>
      {items.map((item) => {
        const org = item.orgSlug ? organizationBySlug(item.orgSlug) : null;
        const certifier = item.certifierSlug ? certifierBySlug(item.certifierSlug) : null;
        const href = item.href ?? org?.websiteUrl ?? certifier?.websiteUrl;
        const mark = (
          <span className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-[var(--map-paper)]/50 px-2 py-1.5">
            {item.orgSlug ? (
              <OrgMark org={item.orgSlug} size={size === "sm" ? "sm" : "md"} />
            ) : null}
            {item.certifierSlug && !item.orgSlug ? (
              <OrgMark certifier={item.certifierSlug} size={size === "sm" ? "sm" : "md"} />
            ) : null}
            {!item.orgSlug && !item.certifierSlug ? (
              <span className="text-sm font-medium">{item.label}</span>
            ) : (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </span>
        );

        return (
          <li key={item.key}>
            {href ? (
              <Link
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="transition-opacity hover:opacity-90"
              >
                {mark}
              </Link>
            ) : (
              mark
            )}
          </li>
        );
      })}
    </ul>
  );
}
