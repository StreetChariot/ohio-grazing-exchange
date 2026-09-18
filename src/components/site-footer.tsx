import { isSupabaseConfigured } from "@/lib/supabase";

export function SiteFooter() {
  const mode = isSupabaseConfigured()
    ? "Listings are saved in Supabase."
    : "Supabase is not connected, so new listings stay on this machine with the sample set.";

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Ohio only. Fencing, water, rates, and insurance stay between the two parties.</p>
        <p>{mode}</p>
      </div>
    </footer>
  );
}
