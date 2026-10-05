import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumPostBody } from "@/components/forum-post-body";
import { ForumReplyForm } from "@/components/forum-reply-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import { getForumTopic, resolveForumBoard } from "@/lib/community";
import { formatPosted } from "@/lib/labels";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ board: string; topic: string }>;
}): Promise<Metadata> {
  const { topic: topicId } = await params;
  const thread = await getForumTopic(topicId);
  return { title: thread?.topic.title ?? "Topic" };
}

export default async function ForumTopicPage({
  params,
}: {
  params: Promise<{ board: string; topic: string }>;
}) {
  const { board, topic: topicId } = await params;
  const thread = await getForumTopic(topicId);
  if (!thread || thread.topic.boardSlug !== board) notFound();
  const meta = await resolveForumBoard(board);
  const [account] = await Promise.all([getAccount()]);
  const configured = isSupabaseConfigured();

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-8">
      <div>
        <Button asChild variant="ghost" className="mb-3 -ml-2 px-2">
          <Link href={`/forum/${board}`}>{meta?.title ?? "Board"}</Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{thread.topic.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Started by{" "}
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href={`/members/${thread.topic.authorId}`}
          >
            {thread.topic.authorName}
          </Link>{" "}
          · {formatPosted(thread.topic.createdAt)}
        </p>
      </div>

      <div className="grid gap-4">
        {thread.posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="text-base">
                <Link
                  className="underline-offset-4 hover:underline"
                  href={`/members/${post.authorId}`}
                >
                  {post.authorName}
                </Link>
              </CardTitle>
              <CardDescription>{formatPosted(post.createdAt)}</CardDescription>
            </CardHeader>
            <CardContent>
              <ForumPostBody body={post.body} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <p className="text-sm text-muted-foreground">Connect Supabase to reply.</p>
          ) : account ? (
            <ForumReplyForm
              topicId={thread.topic.id}
              nextPath={`/forum/${board}/${thread.topic.id}`}
            />
          ) : (
            <Button asChild>
              <Link href={`/sign-in?next=/forum/${board}/${thread.topic.id}`}>
                Log in to reply
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
