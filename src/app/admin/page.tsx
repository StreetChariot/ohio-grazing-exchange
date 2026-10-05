import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateSuggestionStatusAction } from "@/app/education/actions";
import { deleteListingAction } from "@/app/listings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import { getFarmtecResearchRollup } from "@/lib/community";
import { EDUCATION_TOPIC_LABELS } from "@/lib/education-resources";
import { listEducationSuggestions } from "@/lib/education-suggestions";
import {
  FF_PRACTICE_LABELS,
  FF_PRESSURE_LABELS,
  LIVESTOCK_INTEGRATION_GOALS,
  LIVESTOCK_INTEGRATION_LABELS,
  FF_PRACTICES,
  FF_PRESSURES,
} from "@/lib/farmtec";
import { formatDate } from "@/lib/labels";
import { listListings, listProfiles } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Host",
  description: "Moderate accounts and listings.",
};

function Avg({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight">
        {value == null ? "—" : `${value}${suffix}`}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const account = await getAccount();
  if (!account) {
    redirect("/sign-in?next=/admin");
  }
  if (!account.isAdmin) {
    redirect("/account");
  }

  const [listings, profiles, farmtec, suggestions] = await Promise.all([
    listListings(),
    listProfiles(),
    getFarmtecResearchRollup().catch(() => null),
    listEducationSuggestions().catch(() => []),
  ]);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Host desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Same job as a Midwest state host: accounts and listings for this
          exchange. No paid plans in this version.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <Link
                      className="underline-offset-4 hover:underline"
                      href={`/members/${profile.id}`}
                    >
                      {profile.display_name || profile.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4">{profile.role === "admin" ? "host" : "member"}</td>
                  <td className="py-2">{formatDate(String(profile.created_at).slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            FarmTec research rollup
            {farmtec ? ` (${farmtec.consentedCount} consented)` : ""}
          </CardTitle>
          <CardDescription>
            Anonymized averages from members who opted in for OSU Extension
            (Wooster) and Stinner Summit fossil-fuel reduction research. No
            names or contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {!farmtec ? (
            <p className="text-sm text-muted-foreground">
              FarmTec table is not available yet. Apply the farmtec migration,
              then members can fill the snapshot on their account.
            </p>
          ) : farmtec.consentedCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              No consented snapshots yet. Members opt in on Account → FarmTec
              research snapshot.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Avg label="Avg acres managed" value={farmtec.avgTotalAcres} />
                <Avg label="Avg row crop %" value={farmtec.avgPctRowCrop} suffix="%" />
                <Avg label="Avg cover crop %" value={farmtec.avgPctCoverCrop} suffix="%" />
                <Avg label="Avg grass / pasture %" value={farmtec.avgPctGrassPasture} suffix="%" />
                <Avg label="Avg other land %" value={farmtec.avgPctOtherLand} suffix="%" />
                <Avg
                  label="Avg % livestock-grazed fields"
                  value={farmtec.avgPctFieldsLivestockGrazed}
                  suffix="%"
                />
                <Avg label="Avg fossil ops %" value={farmtec.avgPctOpsFossilFuel} suffix="%" />
                <Avg label="Avg electric ops %" value={farmtec.avgPctOpsElectric} suffix="%" />
                <Avg label="Avg PTO / tractor %" value={farmtec.avgPctOpsPtoTractor} suffix="%" />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="mb-2 text-sm font-medium">Livestock integration goals</p>
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {LIVESTOCK_INTEGRATION_GOALS.map((key) => (
                      <li key={key}>
                        {farmtec.integrationGoalCounts[key]} · {LIVESTOCK_INTEGRATION_LABELS[key]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Fossil cost pressures</p>
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {FF_PRESSURES.map((key) => (
                      <li key={key}>
                        {farmtec.pressureCounts[key]} · {FF_PRESSURE_LABELS[key]}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Reduction practices in use</p>
                  <ul className="grid gap-1 text-sm text-muted-foreground">
                    {FF_PRACTICES.map((key) => (
                      <li key={key}>
                        {farmtec.practiceCounts[key]} · {FF_PRACTICE_LABELS[key]}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education suggestions ({suggestions.length})</CardTitle>
          <CardDescription>
            From the Education page form. Mark added once the resource is on
            the curated shelf in{" "}
            <code className="text-xs">education-resources.ts</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {suggestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No suggestions yet. Educators submit from /education.
            </p>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="grid gap-2 border-b py-3 last:border-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{suggestion.title}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {suggestion.status}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {suggestion.submitterName} · {suggestion.submitterEmail}
                  {suggestion.sourceLabel ? ` · ${suggestion.sourceLabel}` : ""}
                </p>
                {suggestion.authors ? (
                  <p className="text-sm text-muted-foreground">
                    Authors: {suggestion.authors}
                  </p>
                ) : null}
                {suggestion.notes ? (
                  <p className="text-sm text-muted-foreground">{suggestion.notes}</p>
                ) : null}
                {suggestion.topics.length ? (
                  <p className="text-xs text-muted-foreground">
                    {suggestion.topics
                      .map((t) => EDUCATION_TOPIC_LABELS[t])
                      .join(" · ")}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={suggestion.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    Open source
                  </Link>
                  {(["pending", "reviewed", "added", "declined"] as const).map(
                    (status) =>
                      status === suggestion.status ? null : (
                        <form key={status} action={updateSuggestionStatusAction}>
                          <input type="hidden" name="id" value={suggestion.id} />
                          <input type="hidden" name="status" value={status} />
                          <Button type="submit" variant="outline" size="sm">
                            Mark {status}
                          </Button>
                        </form>
                      ),
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link className="font-medium underline-offset-4 hover:underline" href={`/listings/${listing.id}`}>
                  {listing.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {listing.county} County, {listing.state}
                  {listing.isDemo ? " · DEMO" : listing.ownerId ? "" : " · unowned"}
                </p>
              </div>
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="next" value="/admin" />
                <Button type="submit" variant="destructive" size="sm">
                  Remove
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
