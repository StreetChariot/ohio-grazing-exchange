"use client";

import { useId, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { countiesForState } from "@/lib/region-counties";
import { SERVICE_STATES } from "@/lib/region";
import {
  LAND_TYPE_LABELS,
  LIVESTOCK_LABELS,
  SEASON_LABELS,
  SIDE_LABELS,
} from "@/lib/labels";
import {
  LAND_TYPES,
  LISTING_SIDES,
  LIVESTOCK_TYPES,
  SEASONS,
  type ListingFilters,
} from "@/lib/types";

function choice(value: string | undefined) {
  return value ?? "any";
}

export function ListingFilters({
  filters,
  onChange,
}: {
  filters: ListingFilters;
  onChange: (next: ListingFilters) => void;
}) {
  const stateChosen = Boolean(filters.state);
  const counties = countiesForState(filters.state);
  const dateId = useId();

  function clear() {
    onChange({});
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="grid gap-1.5">
        <Label>Listing side</Label>
        <Select
          value={choice(filters.side)}
          onValueChange={(value) =>
            onChange({
              ...filters,
              side: value === "any" ? undefined : (value as ListingFilters["side"]),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any side" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any side</SelectItem>
            {LISTING_SIDES.map((value) => (
              <SelectItem key={value} value={value}>
                {SIDE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>State</Label>
        <Select
          value={choice(filters.state)}
          onValueChange={(value) =>
            onChange({
              ...filters,
              state: value === "any" ? undefined : (value as ListingFilters["state"]),
              county: undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any state</SelectItem>
            {SERVICE_STATES.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>County</Label>
        <Select
          key={filters.state ?? "any"}
          value={choice(filters.county)}
          disabled={!stateChosen}
          onValueChange={(value) =>
            onChange({
              ...filters,
              county: value === "any" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={stateChosen ? "Any county" : "Choose a state first"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{stateChosen ? "Any county" : "Choose a state first"}</SelectItem>
            {counties.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {stateChosen ? null : (
          <p className="text-xs text-muted-foreground">Choose a state to pick a county.</p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label>Livestock type</Label>
        <Select
          value={choice(filters.livestockType)}
          onValueChange={(value) =>
            onChange({
              ...filters,
              livestockType:
                value === "any" ? undefined : (value as ListingFilters["livestockType"]),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any livestock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any livestock</SelectItem>
            {LIVESTOCK_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {LIVESTOCK_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Forage</Label>
        <Select
          value={choice(filters.landType)}
          onValueChange={(value) =>
            onChange({
              ...filters,
              landType: value === "any" ? undefined : (value as ListingFilters["landType"]),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any forage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any forage</SelectItem>
            {LAND_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {LAND_TYPE_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Season</Label>
        <Select
          value={choice(filters.season)}
          onValueChange={(value) =>
            onChange({
              ...filters,
              season: value === "any" ? undefined : (value as ListingFilters["season"]),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any season</SelectItem>
            {SEASONS.map((value) => (
              <SelectItem key={value} value={value}>
                {SEASON_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={dateId}>Available on</Label>
        <Input
          id={dateId}
          type="date"
          value={filters.onDate ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              onDate: event.target.value || undefined,
            })
          }
        />
      </div>
      <Button type="button" variant="outline" onClick={clear}>
        Clear
      </Button>
    </form>
  );
}

export function MobileFilters({
  filters,
  onChange,
}: {
  filters: ListingFilters;
  onChange: (next: ListingFilters) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter listings</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ListingFilters filters={filters} onChange={onChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
