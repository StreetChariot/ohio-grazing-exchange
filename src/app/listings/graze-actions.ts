"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { getAccount, safeNextPath } from "@/lib/auth";
import { getListing } from "@/lib/listings";
import { proposeGraze, resolveGraze } from "@/lib/community";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export type GrazeFormState = {
  message: string | null;
};

export async function proposeGrazeAction(
  _previous: GrazeFormState,
  formData: FormData,
): Promise<GrazeFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Accounts need a connected Supabase project." };
  }
  const account = await getAccount();
  const listingId = text(formData, "listingId");
  if (!account) {
    redirect(`/sign-in?next=/listings/${listingId}`);
  }
  try {
    const listing = await getListing(listingId);
    if (!listing) return { message: "That listing could not be found." };
    const attested = text(formData, "organicAttested") === "yes";
    await proposeGraze({
      listing,
      userId: account.id,
      counterpartAttested: attested,
    });
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: error instanceof Error ? error.message : "The graze could not be logged.",
    };
  }
  redirect(`/listings/${listingId}`);
}

export async function resolveGrazeAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    throw new Error("Accounts need a connected Supabase project.");
  }
  const account = await getAccount();
  const next = safeNextPath(text(formData, "next") || "/account");
  if (!account) {
    redirect(`/sign-in?next=${next}`);
  }
  const status = text(formData, "status");
  if (status !== "confirmed" && status !== "declined") {
    throw new Error("Choose confirm or decline.");
  }
  try {
    await resolveGraze({
      grazeId: text(formData, "grazeId"),
      userId: account.id,
      isAdmin: account.isAdmin,
      status,
    });
  } catch (error) {
    unstable_rethrow(error);
    throw error instanceof Error ? error : new Error("The graze could not be updated.");
  }
  redirect(next);
}
