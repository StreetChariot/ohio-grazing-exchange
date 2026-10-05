"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ListingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Alert variant="destructive">
        <AlertTitle>Listings could not be loaded</AlertTitle>
        <AlertDescription>
          {error.message || "Something went wrong while reading listings."} Try again,
          or come back in a minute if the data source is down.
        </AlertDescription>
      </Alert>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
