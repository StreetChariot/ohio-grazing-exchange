import type { Metadata } from "next";
import { ListingForm } from "@/components/listing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Post a listing",
  description: "Post Ohio pasture, cover crop, residue, or livestock that needs grazing.",
};

export default function NewListingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a listing</CardTitle>
          <CardDescription>
            Land if you have forage. Livestock if you have animals and need a place
            to graze. Ohio counties only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ListingForm />
        </CardContent>
      </Card>
    </main>
  );
}
