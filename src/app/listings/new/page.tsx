import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Post a listing",
  description: "Post pasture, cover crop, residue, or livestock that needs grazing.",
};

export default async function NewListingPage() {
  if (isSupabaseConfigured()) {
    const account = await getAccount();
    if (!account) {
      redirect("/sign-in?next=/listings/new");
    }
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Post a listing</CardTitle>
            <CardDescription>
              Land if you have forage. Livestock if you have animals and need a place
              to graze. Ohio counties can be posted now. Pennsylvania, Kentucky, and
              West Virginia are part of this exchange.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListingForm
              defaults={{
                contactName: account.displayName,
                contactEmail: account.email ?? undefined,
              }}
            />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a listing</CardTitle>
          <CardDescription>
            Land if you have forage. Livestock if you have animals and need a place
            to graze. Ohio counties can be posted now. Pennsylvania, Kentucky, and
            West Virginia are part of this exchange.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm />
        </CardContent>
      </Card>
    </main>
  );
}
