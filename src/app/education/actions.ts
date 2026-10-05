"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAccount } from "@/lib/auth";
import {
  EDUCATION_TOPICS,
  type EducationTopic,
} from "@/lib/education-resources";
import {
  createEducationSuggestion,
  updateEducationSuggestionStatus,
  type SuggestionStatus,
  SUGGESTION_STATUSES,
} from "@/lib/education-suggestions";

export type SuggestFormState = {
  message: string | null;
  ok: boolean;
  fieldErrors: Partial<
    Record<
      | "title"
      | "url"
      | "authors"
      | "sourceLabel"
      | "topics"
      | "notes"
      | "submitterName"
      | "submitterEmail",
      string
    >
  >;
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const suggestSchema = z.object({
  title: z.string().trim().min(4, "Add a title.").max(200),
  url: z
    .string()
    .trim()
    .url("Use a full URL (https://…).")
    .max(500),
  authors: z.string().trim().max(400).optional(),
  sourceLabel: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1200).optional(),
  submitterName: z.string().trim().min(2, "Add your name.").max(80),
  submitterEmail: z.string().trim().email("Use a valid email.").max(120),
  topics: z.array(z.string()).max(6),
});

export async function suggestEducationAction(
  _previous: SuggestFormState,
  formData: FormData,
): Promise<SuggestFormState> {
  const topics = formData
    .getAll("topics")
    .map(String)
    .filter((t): t is EducationTopic =>
      (EDUCATION_TOPICS as readonly string[]).includes(t),
    );

  const parsed = suggestSchema.safeParse({
    title: text(formData, "title"),
    url: text(formData, "url"),
    authors: text(formData, "authors") || undefined,
    sourceLabel: text(formData, "sourceLabel") || undefined,
    notes: text(formData, "notes") || undefined,
    submitterName: text(formData, "submitterName"),
    submitterEmail: text(formData, "submitterEmail"),
    topics,
  });

  if (!parsed.success) {
    const fieldErrors: SuggestFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof SuggestFormState["fieldErrors"]] = issue.message;
      }
    }
    return {
      message: "Check the fields below.",
      ok: false,
      fieldErrors,
    };
  }

  const account = await getAccount();

  try {
    await createEducationSuggestion({
      title: parsed.data.title,
      url: parsed.data.url,
      authors: parsed.data.authors ?? null,
      sourceLabel: parsed.data.sourceLabel ?? null,
      topics,
      notes: parsed.data.notes ?? null,
      submitterName: parsed.data.submitterName,
      submitterEmail: parsed.data.submitterEmail,
      profileId: account?.id ?? null,
    });
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Could not save that suggestion.",
      ok: false,
      fieldErrors: {},
    };
  }

  revalidatePath("/education");
  revalidatePath("/admin");
  return {
    message: "Thanks — hosts will review it for the curated shelf.",
    ok: true,
    fieldErrors: {},
  };
}

export async function updateSuggestionStatusAction(formData: FormData) {
  const account = await getAccount();
  if (!account?.isAdmin) {
    return;
  }
  const id = text(formData, "id");
  const status = text(formData, "status");
  if (!id || !(SUGGESTION_STATUSES as readonly string[]).includes(status)) {
    return;
  }
  await updateEducationSuggestionStatus(id, status as SuggestionStatus);
  revalidatePath("/admin");
  revalidatePath("/education");
}
