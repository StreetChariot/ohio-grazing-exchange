import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type Account = {
  id: string;
  email: string | null;
  displayName: string;
  isAdmin: boolean;
};

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/account";
  }
  return value;
}

export async function getAccount(): Promise<Account | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (typeof sub !== "string") return null;

  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", sub)
    .maybeSingle();

  return {
    id: sub,
    email,
    displayName: profile?.display_name || email || "Member",
    isAdmin: profile?.role === "admin",
  };
}

