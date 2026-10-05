"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth";

export type AuthFormState = {
  message: string | null;
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Accounts need a connected Supabase project." };
  }

  const email = text(formData, "email");
  const password = text(formData, "password");
  const next = safeNextPath(text(formData, "next") || "/account");

  if (!email || !password) {
    return { message: "Enter an email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { message: error.message };
  }
  redirect(next);
}

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Accounts need a connected Supabase project." };
  }

  const displayName = text(formData, "displayName");
  const email = text(formData, "email");
  const password = text(formData, "password");
  const next = safeNextPath(text(formData, "next") || "/account");

  if (displayName.length < 2) {
    return { message: "Add a name, at least 2 characters." };
  }
  if (!email || password.length < 8) {
    return { message: "Use a real email and a password of at least 8 characters." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:47281";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    return { message: error.message };
  }
  if (!data.session) {
    return {
      message:
        "Check your email to confirm the account. After that, come back and log in.",
    };
  }
  redirect(next);
}

export async function signOutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
