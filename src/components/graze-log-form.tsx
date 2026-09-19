"use client";

import { useActionState, useState } from "react";
import { proposeGrazeAction, type GrazeFormState } from "@/app/listings/graze-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  organicBadgeLabel,
  organicCounterpartLabel,
  organicRestrictionNote,
} from "@/lib/organic";

const initialState: GrazeFormState = { message: null };

export function GrazeLogForm({
  listingId,
  listingSide,
  listingOrganic,
}: {
  listingId: string;
  listingSide: "land" | "livestock";
  listingOrganic: boolean;
}) {
  const [state, action, pending] = useActionState(proposeGrazeAction, initialState);
  const [attested, setAttested] = useState(false);
  const label =
    listingSide === "land"
      ? "We grazed this land"
      : "My land hosted these animals";

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="organicAttested" value={attested ? "yes" : "no"} />
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {listingOrganic ? (
        <>
          <p className="text-sm text-muted-foreground">
            {organicRestrictionNote(listingSide)} Attestation is for this graze
            only — a farm may still run conventional acres or herds under other
            listings.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              checked={attested}
              onChange={(event) => setAttested(event.target.checked)}
              required
            />
            <span>
              I confirm that for this graze my {organicCounterpartLabel(listingSide)}{" "}
              matches this {organicBadgeLabel(listingSide).toLowerCase()} listing,
              and we are not mixing organic and conventional stock or forage on
              this match.
            </span>
          </label>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This listing is conventional for this field or herd. Organic and
          mixed farms may still use it when the stock or forage on this match is
          not under organic certification. Counts toward badges only after the
          listing owner confirms.
        </p>
      )}
      <Button type="submit" disabled={pending || (listingOrganic && !attested)}>
        {pending ? "Logging…" : label}
      </Button>
    </form>
  );
}
