"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getAccount, safeNextPath } from "@/lib/auth";
import {
  createForumPost,
  createForumTopic,
  getForumTopic,
  isForumBoardSlug,
  listForumTopics,
  resolveForumBoard,
} from "@/lib/community";
import { forumBodyPlainLength, sanitizeForumHtml } from "@/lib/forum-html";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ForumFormState = {
  message: string | null;
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const topicSchema = z.object({
  board: z.string().refine(isForumBoardSlug, "Choose a board."),
  title: z.string().trim().min(8, "Use at least 8 characters.").max(140),
  body: z.string().trim().max(20000),
});

const postSchema = z.object({
  topicId: z.string().uuid("That topic could not be found."),
  body: z.string().trim().max(20000),
});

function cleanForumBody(raw: string): { ok: true; body: string } | { ok: false; message: string } {
  const body = sanitizeForumHtml(raw);
  if (forumBodyPlainLength(body) < 8) {
    return { ok: false, message: "Add a bit more, at least 8 characters." };
  }
  return { ok: true, body };
}

async function createTopicFromParsed(
  accountId: string,
  board: string,
  title: string,
  body: string,
) {
  if (!(await resolveForumBoard(board))) {
    return { error: "That board does not exist, or you do not have access." as const };
  }
  const topicId = await createForumTopic({
    boardSlug: board,
    authorId: accountId,
    title,
    body,
  });
  return { topicId };
}

export async function createTopicAction(
  _previous: ForumFormState,
  formData: FormData,
): Promise<ForumFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Forums need a connected Supabase project." };
  }
  const account = await getAccount();
  if (!account) {
    const board = text(formData, "board");
    redirect(`/sign-in?next=/forum/${board || "valley"}`);
  }

  const parsed = topicSchema.safeParse({
    board: text(formData, "board"),
    title: text(formData, "title"),
    body: text(formData, "body"),
  });
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Fix the form and try again." };
  }

  const cleaned = cleanForumBody(parsed.data.body);
  if (!cleaned.ok) return { message: cleaned.message };

  try {
    const result = await createTopicFromParsed(
      account.id,
      parsed.data.board,
      parsed.data.title,
      cleaned.body,
    );
    if ("error" in result) {
      return { message: result.error ?? "That board does not exist, or you do not have access." };
    }
    redirect(`/forum/${parsed.data.board}/${result.topicId}`);
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: error instanceof Error ? error.message : "The topic could not be posted.",
    };
  }
}

export async function startCannedTopicAction(
  _previous: ForumFormState,
  formData: FormData,
): Promise<ForumFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Forums need a connected Supabase project." };
  }
  const account = await getAccount();
  const board = text(formData, "board");
  if (!account) {
    redirect(`/sign-in?next=/forum/${board || "valley"}`);
  }

  const parsed = topicSchema.safeParse({
    board,
    title: text(formData, "title"),
    body: text(formData, "body"),
  });
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Fix the form and try again." };
  }

  const cleaned = cleanForumBody(parsed.data.body);
  if (!cleaned.ok) return { message: cleaned.message };

  try {
    const existing = await listForumTopics(parsed.data.board);
    const live = existing.find(
      (topic) => topic.title.trim().toLowerCase() === parsed.data.title.trim().toLowerCase(),
    );
    if (live) {
      redirect(`/forum/${parsed.data.board}/${live.id}`);
    }
    const result = await createTopicFromParsed(
      account.id,
      parsed.data.board,
      parsed.data.title,
      cleaned.body,
    );
    if ("error" in result) {
      return { message: result.error ?? "That board does not exist, or you do not have access." };
    }
    redirect(`/forum/${parsed.data.board}/${result.topicId}`);
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: error instanceof Error ? error.message : "The Summit thread could not be opened.",
    };
  }
}

export async function createPostAction(
  _previous: ForumFormState,
  formData: FormData,
): Promise<ForumFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Forums need a connected Supabase project." };
  }
  const account = await getAccount();
  const topicId = text(formData, "topicId");
  const next = safeNextPath(text(formData, "next") || "/forum");
  if (!account) {
    redirect(`/sign-in?next=${next}`);
  }

  const parsed = postSchema.safeParse({
    topicId,
    body: text(formData, "body"),
  });
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Fix the form and try again." };
  }

  const cleaned = cleanForumBody(parsed.data.body);
  if (!cleaned.ok) return { message: cleaned.message };

  try {
    const thread = await getForumTopic(parsed.data.topicId);
    if (!thread) {
      return { message: "That topic could not be found." };
    }
    await createForumPost({
      topicId: parsed.data.topicId,
      authorId: account.id,
      body: cleaned.body,
    });
    redirect(`/forum/${thread.topic.boardSlug}/${parsed.data.topicId}`);
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: error instanceof Error ? error.message : "The reply could not be posted.",
    };
  }
}
