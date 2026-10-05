import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumTopicForm } from "@/components/forum-topic-form";
import { StartCannedTopic } from "@/components/start-canned-topic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import { listForumTopics, resolveForumBoard } from "@/lib/community";
import { forumBoardIcon } from "@/lib/forum-icons";
import { formatPosted } from "@/lib/labels";
import {
  cannedTopicsForBoard,
  isStinnerBoardSlug,
  stinnerBoardMeta,
} from "@/lib/stinner";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string }>;
}): Promise<Metadata> {
  const { board } = await params;
  const meta = await resolveForumBoard(board);
  return { title: meta?.title ?? "Forum" };
}

function matchLiveTopic(
  topics: Awaited<ReturnType<typeof listForumTopics>>,
  title: string,
) {
  const needle = title.trim().toLowerCase();
  return topics.find((topic) => topic.title.trim().toLowerCase() === needle) ?? null;
}

export default async function ForumBoardPage({
  params,
}: {
  params: Promise<{ board: string }>;
}) {
  const { board } = await params;
  const meta = await resolveForumBoard(board);
  if (!meta) notFound();

  const [topics, account] = await Promise.all([listForumTopics(board), getAccount()]);
  const configured = isSupabaseConfigured();
  const Icon = forumBoardIcon(meta.slug, meta.privateLane, meta.laneKind);
  const stinner = stinnerBoardMeta(board);
  const canned = cannedTopicsForBoard(board);

  return (
    <main className="mx-auto grid max-w-3xl gap-8 px-4 py-8">
      <div>
        <Button asChild variant="ghost" className="mb-3 -ml-2 px-2">
          <Link href="/forum">All boards</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-md bg-[var(--map-paper)] text-[var(--land)]">
            <Icon className="size-5" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
          {meta.privateLane ? <Badge variant="secondary">Members only</Badge> : null}
          {meta.laneKind === "chosen-projects" ? (
            <Badge variant="secondary">Chosen Projects</Badge>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{meta.description}</p>
        {meta.allianceSlug ? (
          <p className="mt-2 text-sm">
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href={`/alliances/${meta.allianceSlug}`}
            >
              Open this alliance
            </Link>
          </p>
        ) : null}
        {stinner ? (
          <p className="mt-2 text-sm">
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href={`/forum/${stinner.siblingSlug}`}
            >
              {stinner.siblingLabel}
            </Link>
            {" · "}
            {stinner.eventDateLabel} · {stinner.venue}
          </p>
        ) : null}
        {meta.privateLane ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Only co-op members and marked co-op staff can read or post here.
          </p>
        ) : null}
      </div>

      {canned.length > 0 ? (
        <section className="grid gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Precanned subtopics</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Start one of these Summit threads, or open it if someone already has.
            </p>
          </div>
          {canned.map((item) => {
            const live = matchLiveTopic(topics, item.title);
            return (
              <Card key={item.key}>
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.intro}</CardDescription>
                </CardHeader>
                <CardContent>
                  {live ? (
                    <Button asChild size="sm">
                      <Link href={`/forum/${board}/${live.id}`}>Open thread</Link>
                    </Button>
                  ) : account && configured ? (
                    <StartCannedTopic boardSlug={board} title={item.title} body={item.intro} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {account
                        ? "Connect Supabase to open this thread."
                        : "Log in to start this Summit thread."}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Start a topic</CardTitle>
          <CardDescription>
            {account
              ? isStinnerBoardSlug(board)
                ? "Add a freeform Summit thread if the precanned list does not fit."
                : meta.privateLane
                  ? "Member talk and co-op notices belong here. Do not post another member’s phone number."
                  : "Ask about forage, timing, or a county. Do not post another member’s phone number."
              : "Log in with a free account to post."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <p className="text-sm text-muted-foreground">Connect Supabase to post.</p>
          ) : account ? (
            <ForumTopicForm boardSlug={board} />
          ) : (
            <Button asChild>
              <Link href={`/sign-in?next=/forum/${board}`}>Log in to post</Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Open topics</h2>
        {topics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {canned.length
              ? "No live threads yet — open a precanned subtopic above."
              : "No topics on this board yet."}
          </p>
        ) : (
          topics.map((topic) => (
            <Link key={topic.id} href={`/forum/${board}/${topic.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{topic.title}</CardTitle>
                  <CardDescription>
                    {topic.authorName} · {formatPosted(topic.createdAt)} · {topic.replyCount}{" "}
                    {topic.replyCount === 1 ? "reply" : "replies"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
