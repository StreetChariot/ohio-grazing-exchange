import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ListingNotFound() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Listing not found</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <p>That listing is not in the exchange. It may have been typed wrong, or it was never posted.</p>
          <Button asChild>
            <Link href="/listings">Back to listings</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
