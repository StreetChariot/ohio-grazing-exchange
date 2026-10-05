import type { Metadata } from "next";
import Link from "next/link";
import { OrgMark } from "@/components/org-mark";
import { PartnerMarksStrip } from "@/components/partner-marks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import type { ForumBoard } from "@/lib/community";
import { listForumBoards } from "@/lib/community";
import { forumBoardIcon } from "@/lib/forum-icons";
import type { OrganizationSlug } from "@/lib/organizations";
import { STINNER_YEARS, stinnerYearLabel } from "@/lib/stinner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forum",
  description:
    "Valley, alliance, Stinner Summit, and private co-op discussion for the grazing exchange.",
};

function coopOrgSlug(coopSlug: string | null): OrganizationSlug | null {
  if (coopSlug === "organic-valley") return "organic-valley";
  if (coopSlug === "farmers-union") return "farmers-union";
  if (coopSlug === "oeffa-growers") return "oeffa";
  return null;
}

function BoardCard({ board }: { board: ForumBoard }) {
  const Icon = forumBoardIcon(board.slug, board.privateLane, board.laneKind);
  const orgSlug = coopOrgSlug(board.coopSlug);
  return (
    <Link href={`/forum/${board.slug}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {orgSlug ? (
              <OrgMark org={orgSlug} />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-md bg-[var(--map-paper)] text-[var(--land)]">
                <Icon className="size-4" aria-hidden />
              </span>
            )}
            <CardTitle className="text-base sm:text-lg">{board.title}</CardTitle>
            {board.privateLane ? <Badge variant="secondary">Members only</Badge> : null}
            {board.laneKind === "chosen-projects" ? (
              <Badge variant="secondary">Chosen Projects</Badge>
            ) : null}
          </div>
          <CardDescription>{board.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {board.topicCount} {board.topicCount === 1 ? "topic" : "topics"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function ForumIndexPage() {
  const [boards, account] = await Promise.all([listForumBoards(), getAccount()]);
  const configured = isSupabaseConfigured();

  const valleyBoards = boards.filter((board) => !board.privateLane && board.series !== "stinner");
  const coopBoards = boards.filter((board) => board.privateLane);
  const stinnerBoards = boards.filter((board) => board.series === "stinner");

  const stinnerByYear = STINNER_YEARS.map((year) => {
    const main =
      stinnerBoards.find((board) => board.slug === year.mainBoardSlug) ??
      ({
        slug: year.mainBoardSlug,
        title: stinnerYearLabel(year.year),
        description: `${year.theme}. ${year.eventDateLabel} · ${year.venue}.`,
        allianceSlug: null,
        coopSlug: null,
        privateLane: false,
        series: "stinner",
        summitYear: year.year,
        laneKind: "year",
        topicCount: 0,
      } satisfies ForumBoard);
    const chosen =
      stinnerBoards.find((board) => board.slug === year.chosenBoardSlug) ??
      ({
        slug: year.chosenBoardSlug,
        title: `Chosen Projects · ${year.year}`,
        description: `Projects chosen from the ${year.edition}th Stinner Summit.`,
        allianceSlug: null,
        coopSlug: null,
        privateLane: false,
        series: "stinner",
        summitYear: year.year,
        laneKind: "chosen-projects",
        topicCount: 0,
      } satisfies ForumBoard);
    return { year, main, chosen };
  });

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Forum</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          Valley and alliance boards are public to read. Stinner Summit lanes are
          organized by year — 2026 opens as the 20th Annual Summit, with
          precanned threads and a Chosen Projects lane. Co-op lanes stay private
          to members.
        </p>
      </div>

      {!configured ? (
        <p className="text-sm text-muted-foreground">
          Forums save when Supabase is connected. Board layout is visible now.
        </p>
      ) : null}

      {!account && configured ? (
        <p className="text-sm">
          <Link className="text-primary underline-offset-4 hover:underline" href="/sign-in?next=/forum">
            Log in
          </Link>{" "}
          or{" "}
          <Link className="text-primary underline-offset-4 hover:underline" href="/sign-up?next=/forum">
            create a free account
          </Link>{" "}
          to start a topic. Add co-ops on your account to unlock private lanes.
        </p>
      ) : null}

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Valley and alliances</h2>
        <div className="grid gap-4">
          {valleyBoards.map((board) => (
            <BoardCard key={board.slug} board={board} />
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Stinner Summits</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Year by year, starting with the 20th Annual Summit in 2026. Open a
            precanned subtopic on the year board, or follow Chosen Projects in
            its own lane.
          </p>
        </div>
        {stinnerByYear.map(({ year, main, chosen }) => (
          <div key={year.year} className="grid gap-3 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {year.edition}th · {year.year}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {year.theme}. {year.eventDateLabel} · {year.venue}.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <BoardCard board={main} />
              <BoardCard board={chosen} />
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Co-op lanes</h2>
        {coopBoards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {account
              ? "No private co-op lanes yet. Add Organic Valley or another co-op on your account profile to open a member channel."
              : "Log in and list a co-op on your profile to see private member lanes here."}
          </p>
        ) : (
          <div className="grid gap-4">
            {coopBoards.map((board) => (
              <BoardCard key={board.slug} board={board} />
            ))}
          </div>
        )}
      </section>

      <PartnerMarksStrip heading="Partner marks on the exchange" />
    </main>
  );
}
