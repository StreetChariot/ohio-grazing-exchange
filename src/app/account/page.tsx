import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteListingAction } from "@/app/listings/actions";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import { listOwnedListings } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  description: "Your Ohio Valley Grazing Exchange listings.",
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const account = await getAccount();
  if (!account) {
    redirect("/sign-in?next=/account");
  }

  const listings = await listOwnedListings(account.id);

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {account.displayName}
            {account.email ? ` · ${account.email}` : ""}
            {account.isAdmin ? " · host" : " · member"}
          </p>
        </div>
        <Button asChild>
          <Link href="/listings/new">Post a listing</Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No listings yet</CardTitle>
            <CardDescription>
              Post land or livestock. Other members will see your contact once they log in.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((listing) => (
            <div key={listing.id} className="grid gap-2">
              <ListingCard listing={listing} />
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <input type="hidden" name="next" value="/account" />
                <Button type="submit" variant="outline" size="sm">
                  Remove
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
