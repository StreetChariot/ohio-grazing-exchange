"use client";

import { useActionState, useState } from "react";
import { createListingAction, type ListingFormState } from "@/app/listings/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OHIO_COUNTIES } from "@/lib/counties";
import {
  FENCING_LABELS,
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import {
  FENCING_OPTIONS,
  LAND_TYPES,
  LISTING_SIDES,
  LIVESTOCK_TYPES,
  SEASONS,
  type ListingSide,
} from "@/lib/types";

const initialState: ListingFormState = { message: null, fieldErrors: {} };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function ListingForm({
  defaults,
}: {
  defaults?: { contactName?: string; contactEmail?: string };
}) {
  const [state, action, pending] = useActionState(createListingAction, initialState);
  const [side, setSide] = useState<ListingSide>("land");
  const [county, setCounty] = useState(OHIO_COUNTIES[0]?.name ?? "Adams");
  const [landType, setLandType] = useState<string>(LAND_TYPES[0]);
  const [livestockType, setLivestockType] = useState<string>(LIVESTOCK_TYPES[0]);
  const [fencing, setFencing] = useState<string>("perimeter");
  const [waterAvailable, setWaterAvailable] = useState("yes");

  return (
    <form action={action} className="grid gap-5">
      {state.message ? (
        <Alert variant="destructive">
          <AlertTitle>Listing not posted</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <input type="hidden" name="side" value={side} />
      <input type="hidden" name="county" value={county} />
      <input type="hidden" name="landType" value={landType === "unset" ? "" : landType} />
      <input type="hidden" name="livestockType" value={livestockType} />
      {side === "land" ? (
        <>
          <input type="hidden" name="fencing" value={fencing} />
          <input type="hidden" name="waterAvailable" value={waterAvailable} />
        </>
      ) : null}

      <div className="grid gap-1.5">
        <Label>Which side are you on?</Label>
        <Select
          value={side}
          onValueChange={(value) => {
            const next = value as ListingSide;
            setSide(next);
            if (next === "land" && landType === "unset") setLandType(LAND_TYPES[0]);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LISTING_SIDES.map((value) => (
              <SelectItem key={value} value={value}>
                {value === "land"
                  ? `${SIDE_LABELS[value]} — I have forage`
                  : `${SIDE_LABELS[value]} — I have animals`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={state.fieldErrors.side} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={8} maxLength={140} placeholder="What you have, and roughly where" aria-invalid={Boolean(state.fieldErrors.title)} />
        <FieldError message={state.fieldErrors.title} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>County</Label>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OHIO_COUNTIES.map((item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={state.fieldErrors.county} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="nearestTown">Nearest town</Label>
          <Input id="nearestTown" name="nearestTown" required maxLength={80} aria-invalid={Boolean(state.fieldErrors.nearestTown)} />
          <FieldError message={state.fieldErrors.nearestTown} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Livestock</Label>
          <Select value={livestockType} onValueChange={setLivestockType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIVESTOCK_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {LIVESTOCK_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={state.fieldErrors.livestockType} />
        </div>
        <div className="grid gap-1.5">
          <Label>{side === "land" ? "Forage on offer" : "Forage you want"}</Label>
          <Select value={landType} onValueChange={setLandType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {side === "livestock" ? <SelectItem value="unset">No preference</SelectItem> : null}
              {LAND_TYPES.map((value) => (
                <SelectItem key={value} value={value}>
                  {LAND_TYPE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={state.fieldErrors.landType} />
        </div>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Seasons</legend>
        <div className="flex flex-wrap gap-3">
          {SEASONS.map((season) => (
            <label key={season} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="seasons" value={season} className="size-4 accent-primary" />
              {SEASON_LABELS[season]}
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors.seasons} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="availableFrom">Available from</Label>
          <Input id="availableFrom" name="availableFrom" type="date" required aria-invalid={Boolean(state.fieldErrors.availableFrom)} />
          <FieldError message={state.fieldErrors.availableFrom} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="availableUntil">Available until</Label>
          <Input id="availableUntil" name="availableUntil" type="date" required aria-invalid={Boolean(state.fieldErrors.availableUntil)} />
          <FieldError message={state.fieldErrors.availableUntil} />
        </div>
      </div>

      {side === "land" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="acres">Acres</Label>
            <Input id="acres" name="acres" type="number" min="0.1" step="0.1" required aria-invalid={Boolean(state.fieldErrors.acres)} />
            <FieldError message={state.fieldErrors.acres} />
          </div>
          <div className="grid gap-1.5">
            <Label>Fencing</Label>
            <Select value={fencing} onValueChange={setFencing}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FENCING_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {FENCING_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Water</Label>
            <Select value={waterAvailable} onValueChange={setWaterAvailable}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Water on site</SelectItem>
                <SelectItem value="no">No water</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="headCount">Head count</Label>
            <Input id="headCount" name="headCount" type="number" min="1" step="1" required aria-invalid={Boolean(state.fieldErrors.headCount)} />
            <FieldError message={state.fieldErrors.headCount} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="travelRadiusMiles">Travel radius (miles)</Label>
            <Input id="travelRadiusMiles" name="travelRadiusMiles" type="number" min="0" step="1" required aria-invalid={Boolean(state.fieldErrors.travelRadiusMiles)} />
            <FieldError message={state.fieldErrors.travelRadiusMiles} />
          </div>
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="rateNotes">Rate notes</Label>
        <Input id="rateNotes" name="rateNotes" maxLength={240} placeholder="Optional. Per head, per day, or a trade." />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required minLength={20} rows={5} aria-invalid={Boolean(state.fieldErrors.description)} />
        <FieldError message={state.fieldErrors.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="contactName">Contact name</Label>
          <Input id="contactName" name="contactName" required defaultValue={defaults?.contactName} aria-invalid={Boolean(state.fieldErrors.contactName)} />
          <FieldError message={state.fieldErrors.contactName} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="contactEmail">Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" required defaultValue={defaults?.contactEmail} aria-invalid={Boolean(state.fieldErrors.contactEmail)} />
          <FieldError message={state.fieldErrors.contactEmail} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="contactPhone">Phone</Label>
          <Input id="contactPhone" name="contactPhone" type="tel" />
        </div>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-fit">
        {pending ? "Posting…" : "Post listing"}
      </Button>
    </form>
  );
}
