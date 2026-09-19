import type { Metadata } from "next";
import Link from "next/link";
import { OrgMark } from "@/components/org-mark";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CERTIFIERS,
  INTEGRITY_CERTIFIER_LOCATOR,
} from "@/lib/certifiers";
import { ORGANIZATIONS } from "@/lib/organizations";

export const metadata: Metadata = {
  title: "Partners and certifiers",
  description:
    "OEFFA, SARE, Extension, USDA, Stratford, and USDA-accredited organic certifiers serving Ohio, Pennsylvania, Kentucky, and West Virginia.",
};

export default function PartnersPage() {
  const partners = ORGANIZATIONS.filter((org) => org.kind !== "coop");
  const regional = CERTIFIERS.filter((c) => c.regional);
  const national = CERTIFIERS.filter((c) => !c.regional && c.slug !== "other");

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Partners and certifiers</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          Logos mark memberships, Extension ties, and USDA organic status across
          profiles, listings, alliances, and forums. Certifiers below are
          USDA-accredited agents commonly used in the Valley states.
        </p>
      </div>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Organizations</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {partners.map((org) => (
            <Card key={org.slug}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <OrgMark org={org.slug} size="lg" />
                <div>
                  <CardTitle className="text-base">{org.shortName}</CardTitle>
                  <CardDescription>{org.name}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2">
                <p className="text-sm text-muted-foreground">{org.blurb}</p>
                <Link
                  href={org.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Website
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Regional organic certifiers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Agents with strong presence in Ohio, Pennsylvania, Kentucky, or West
            Virginia. Official directory:{" "}
            <a
              href={INTEGRITY_CERTIFIER_LOCATOR}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              USDA Organic INTEGRITY Certifier Locator
            </a>
            .
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {regional.map((certifier) => (
            <Card key={certifier.slug}>
              <CardHeader className="flex-row items-start gap-3 space-y-0">
                <OrgMark certifier={certifier.slug} size="lg" />
                <div>
                  <CardTitle className="text-base">{certifier.shortName}</CardTitle>
                  <CardDescription>{certifier.name}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-muted-foreground">
                <p>Serves: {certifier.valleyStates.join(", ")}</p>
                {certifier.agentId ? <p>NOP agent ID: {certifier.agentId}</p> : null}
                <Link
                  href={certifier.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Website
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Other certifiers used in the Valley
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            National or out-of-region agents that still certify operations here.
            Choose &quot;Other NOP certifier&quot; on your profile if yours is
            missing.
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {national.map((certifier) => (
            <li
              key={certifier.slug}
              className="flex items-center gap-3 rounded-md border border-border/70 px-3 py-2"
            >
              <OrgMark certifier={certifier.slug} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{certifier.shortName}</p>
                <p className="truncate text-xs text-muted-foreground">{certifier.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
