import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SuggestEducationForm } from "@/components/suggest-education-form";
import { OrgMark } from "@/components/org-mark";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import {
  EDUCATION_RESOURCES,
  EDUCATION_SOURCE_ORGS,
  EDUCATION_TOPIC_BLURBS,
  EDUCATION_TOPIC_LABELS,
  EDUCATION_TOPICS,
  educationResourceCountsByOrg,
  filterEducationResources,
  formatAuthorList,
  isEducationSourceOrg,
  isEducationTopic,
  type EducationSourceOrg,
  type EducationTopic,
} from "@/lib/education-resources";
import { organizationBySlug } from "@/lib/organizations";

export const metadata: Metadata = {
  title: "Education",
  description:
    "Curated partner Extension and research on cover crops, livestock reintegration, managed grazing, silvopasture, and cutting fossil-fuel farm power — with full attribution and links to the originals.",
};

type SearchParams = Promise<{ topic?: string; source?: string }>;

function parseTopic(value: string | undefined): EducationTopic | "all" {
  if (!value || value === "all") return "all";
  return isEducationTopic(value) ? value : "all";
}

function parseSource(value: string | undefined): EducationSourceOrg | "all" {
  if (!value || value === "all") return "all";
  return isEducationSourceOrg(value) ? value : "all";
}

function hrefFor(opts: {
  topic: EducationTopic | "all";
  source: EducationSourceOrg | "all";
}) {
  const params = new URLSearchParams();
  if (opts.topic !== "all") params.set("topic", opts.topic);
  if (opts.source !== "all") params.set("source", opts.source);
  const q = params.toString();
  return q ? `/education?${q}` : "/education";
}

export default async function EducationPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { topic: topicParam, source: sourceParam } = await searchParams;
  const topic = parseTopic(topicParam);
  const source = parseSource(sourceParam);
  const resources = filterEducationResources({ topic, source });
  const orgCounts = educationResourceCountsByOrg();
  const account = await getAccount();

  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-4 py-8">
      <div className="grid gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Education</h1>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          A core leg of the Exchange: curated partner teaching on covers,
          bringing livestock back, managed grazing, silvopasture, and shrinking
          diesel and fertilizer. We summarize and credit; the full piece lives
          on the author&apos;s site.
        </p>
        <p className="text-sm text-muted-foreground">
          {EDUCATION_RESOURCES.length} resources from OSU, Penn State, Kentucky,
          WVU, SARE, OEFFA, and Stratford — lined up with FarmTec / Stinner
          fossil-fuel themes.
        </p>
      </div>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Theme</h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            href={hrefFor({ topic: "all", source })}
            active={topic === "all"}
            label="All themes"
          />
          {EDUCATION_TOPICS.map((t) => (
            <FilterChip
              key={t}
              href={hrefFor({ topic: t, source })}
              active={topic === t}
              label={EDUCATION_TOPIC_LABELS[t]}
            />
          ))}
        </div>
        {topic !== "all" ? (
          <p className="text-sm text-muted-foreground">
            {EDUCATION_TOPIC_BLURBS[topic]}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Source</h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            href={hrefFor({ topic, source: "all" })}
            active={source === "all"}
            label="All partners"
          />
          {EDUCATION_SOURCE_ORGS.map((slug) => {
            const org = organizationBySlug(slug);
            if (!org) return null;
            return (
              <FilterChip
                key={slug}
                href={hrefFor({ topic, source: slug })}
                active={source === slug}
                label={`${org.shortName} (${orgCounts.get(slug) ?? 0})`}
              />
            );
          })}
        </div>
      </section>

      <section className="grid gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {topic === "all" && source === "all"
              ? "Curated shelf"
              : [
                  topic !== "all" ? EDUCATION_TOPIC_LABELS[topic] : null,
                  source !== "all"
                    ? organizationBySlug(source)?.shortName
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {resources.length}{" "}
            {resources.length === 1 ? "resource" : "resources"}
          </p>
        </div>

        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing in that filter yet.{" "}
            <Link
              href="/education"
              className="text-primary underline-offset-4 hover:underline"
            >
              Clear filters
            </Link>{" "}
            or suggest a resource below.
          </p>
        ) : (
          <ul className="grid gap-4">
            {resources.map((resource) => {
              const org = organizationBySlug(resource.sourceOrg);
              return (
                <li key={resource.id}>
                  <Card>
                    <CardHeader className="gap-3 space-y-0 sm:flex-row sm:items-start">
                      {org ? (
                        <OrgMark org={org.slug} size="lg" className="shrink-0" />
                      ) : null}
                      <div className="grid min-w-0 flex-1 gap-2">
                        <div className="grid gap-1">
                          <CardTitle className="text-base leading-snug">
                            {resource.title}
                          </CardTitle>
                          <CardDescription>
                            {resource.sourceLabel}
                            {resource.publishedLabel
                              ? ` · ${resource.publishedLabel}`
                              : null}
                          </CardDescription>
                        </div>
                        <p className="text-sm text-foreground/90">
                          <span className="font-medium text-foreground">
                            Authors:{" "}
                          </span>
                          {formatAuthorList(resource.authors)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {resource.summary}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {resource.topics.map((t) => (
                            <Badge key={t} variant="secondary">
                              {EDUCATION_TOPIC_LABELS[t]}
                            </Badge>
                          ))}
                        </div>
                        <Link
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Read on the source site
                          <ExternalLink className="size-3.5" aria-hidden />
                        </Link>
                      </div>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-4 rounded-lg border border-border/70 px-4 py-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Suggest a resource
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Educators and members: point us at a fact sheet, bulletin, or farm
            tour write-up. Hosts curate before it lands on the shelf — we need
            the outlink and author credit.
          </p>
        </div>
        <SuggestEducationForm
          defaultName={account?.displayName}
          defaultEmail={account?.email ?? undefined}
        />
      </section>

      <section className="rounded-lg border border-border/70 bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Attribution
        </h2>
        <p className="mt-2 max-w-3xl">
          Every card names the authors and publisher and links to their post,
          PDF, or project page. Summaries are written for the Exchange; they are
          not reprints.
        </p>
        <p className="mt-2">
          Related:{" "}
          <Link
            href="/partners"
            className="text-primary underline-offset-4 hover:underline"
          >
            Partners and certifiers
          </Link>
          {" · "}
          <Link
            href="/forum"
            className="text-primary underline-offset-4 hover:underline"
          >
            Forum
          </Link>
          {" · "}
          <Link
            href="/forum/stinner-2026"
            className="text-primary underline-offset-4 hover:underline"
          >
            Stinner Summit 2026
          </Link>
        </p>
      </section>
    </main>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
          : "rounded-md border border-border/80 bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      }
    >
      {label}
    </Link>
  );
}
