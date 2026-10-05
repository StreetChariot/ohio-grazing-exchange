import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { EducationTopic } from "@/lib/education-resources";
import { EDUCATION_TOPICS } from "@/lib/education-resources";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const SUGGESTION_STATUSES = [
  "pending",
  "reviewed",
  "added",
  "declined",
] as const;

export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type EducationSuggestion = {
  id: string;
  createdAt: string;
  title: string;
  url: string;
  authors: string | null;
  sourceLabel: string | null;
  topics: EducationTopic[];
  notes: string | null;
  submitterName: string;
  submitterEmail: string;
  profileId: string | null;
  status: SuggestionStatus;
};

export type NewEducationSuggestion = {
  title: string;
  url: string;
  authors: string | null;
  sourceLabel: string | null;
  topics: EducationTopic[];
  notes: string | null;
  submitterName: string;
  submitterEmail: string;
  profileId: string | null;
};

const localFile = path.join(process.cwd(), "data", "education-suggestions.json");

function parseTopics(raw: unknown): EducationTopic[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is EducationTopic =>
    (EDUCATION_TOPICS as readonly string[]).includes(String(t)),
  );
}

function parseStatus(raw: unknown): SuggestionStatus {
  const value = String(raw ?? "pending");
  return (SUGGESTION_STATUSES as readonly string[]).includes(value)
    ? (value as SuggestionStatus)
    : "pending";
}

async function readLocal(): Promise<EducationSuggestion[]> {
  try {
    const raw = await readFile(localFile, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: String(r.id),
        createdAt: String(r.createdAt ?? r.created_at),
        title: String(r.title),
        url: String(r.url),
        authors: r.authors == null ? null : String(r.authors),
        sourceLabel:
          r.sourceLabel == null && r.source_label == null
            ? null
            : String(r.sourceLabel ?? r.source_label),
        topics: parseTopics(r.topics),
        notes: r.notes == null ? null : String(r.notes),
        submitterName: String(r.submitterName ?? r.submitter_name),
        submitterEmail: String(r.submitterEmail ?? r.submitter_email),
        profileId:
          r.profileId == null && r.profile_id == null
            ? null
            : String(r.profileId ?? r.profile_id),
        status: parseStatus(r.status),
      };
    });
  } catch {
    return [];
  }
}

async function writeLocal(rows: EducationSuggestion[]) {
  await mkdir(path.dirname(localFile), { recursive: true });
  await writeFile(localFile, JSON.stringify(rows, null, 2));
}

function fromRow(row: Record<string, unknown>): EducationSuggestion {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    title: String(row.title),
    url: String(row.url),
    authors: row.authors == null ? null : String(row.authors),
    sourceLabel: row.source_label == null ? null : String(row.source_label),
    topics: parseTopics(row.topics),
    notes: row.notes == null ? null : String(row.notes),
    submitterName: String(row.submitter_name),
    submitterEmail: String(row.submitter_email),
    profileId: row.profile_id == null ? null : String(row.profile_id),
    status: parseStatus(row.status),
  };
}

export async function createEducationSuggestion(input: NewEducationSuggestion) {
  if (!isSupabaseConfigured()) {
    const rows = await readLocal();
    const next: EducationSuggestion = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      title: input.title,
      url: input.url,
      authors: input.authors,
      sourceLabel: input.sourceLabel,
      topics: input.topics,
      notes: input.notes,
      submitterName: input.submitterName,
      submitterEmail: input.submitterEmail,
      profileId: input.profileId,
      status: "pending",
    };
    rows.unshift(next);
    await writeLocal(rows);
    return next;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("education_suggestions")
    .insert({
      title: input.title,
      url: input.url,
      authors: input.authors,
      source_label: input.sourceLabel,
      topics: input.topics,
      notes: input.notes,
      submitter_name: input.submitterName,
      submitter_email: input.submitterEmail,
      profile_id: input.profileId,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return fromRow(data as Record<string, unknown>);
}

export async function listEducationSuggestions(): Promise<EducationSuggestion[]> {
  if (!isSupabaseConfigured()) {
    return readLocal();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("education_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => fromRow(row as Record<string, unknown>));
}

export async function updateEducationSuggestionStatus(
  id: string,
  status: SuggestionStatus,
) {
  if (!isSupabaseConfigured()) {
    const rows = await readLocal();
    const next = rows.map((row) =>
      row.id === id ? { ...row, status } : row,
    );
    await writeLocal(next);
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("education_suggestions")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
