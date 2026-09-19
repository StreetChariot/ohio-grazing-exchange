import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SiteFooter() {
  const mode = isSupabaseConfigured()
    ? "Listings are saved in Supabase."
    : "Supabase is not connected, so new listings stay on this machine with the sample set.";

  return (
    <footer className="mt-auto border-t print:hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Ohio, Pennsylvania, Kentucky, and West Virginia.{" "}
          <Link className="underline-offset-4 hover:underline" href="/education">
            Education
          </Link>
          {" · "}
          <Link className="underline-offset-4 hover:underline" href="/alliances">
            Alliances
          </Link>
          {" · "}
          <Link className="underline-offset-4 hover:underline" href="/forum">
            Forum
          </Link>
          . Fencing, water, rates, and insurance stay between the two parties.
        </p>
        <p>{mode}</p>
      </div>
    </footer>
  );
}
