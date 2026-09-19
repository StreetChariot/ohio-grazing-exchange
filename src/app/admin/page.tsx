import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteListingAction } from "@/app/listings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { listListings, listProfiles } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Host",
  description: "Moderate accounts and listings.",
};

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const account = await getAccount();
  if (!account) {
    redirect("/sign-in?next=/admin");
  }
  if (!account.isAdmin) {
    redirect("/account");
  }

  const [listings, profiles] = await Promise.all([listListings(), listProfiles()]);

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Host desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Same job as a Midwest state host: accounts and listings for this
          exchange. No paid plans in this version.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{profile.display_name || profile.id}</td>
                  <td className="py-2 pr-4">{profile.role === "admin" ? "host" : "member"}</td>
                  <td className="py-2">{formatDate(String(profile.created_at).slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex flex-col gap-2 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link className="font-medium underline-offset-4 hover:underline" href={`/listings/${listing.id}`}>
                  {listing.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {listing.county} County, {listing.state}
                  {listing.ownerId ? "" : " · sample / unowned"}
                </p>
              </div>
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="next" value="/admin" />
                <Button type="submit" variant="destructive" size="sm">
                  Remove
                </Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
