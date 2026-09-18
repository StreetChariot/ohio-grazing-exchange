"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { OHIO_COUNTIES } from "@/lib/counties";
import { filtersToSearchParams } from "@/lib/filters";
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
  defaults,
  onApplied,
}: {
  defaults: ListingFilters;
  onApplied?: () => void;
}) {
  const router = useRouter();
  const [side, setSide] = useState(choice(defaults.side));
  const [county, setCounty] = useState(choice(defaults.county));
  const [livestock, setLivestock] = useState(choice(defaults.livestockType));
  const [landType, setLandType] = useState(choice(defaults.landType));
  const [season, setSeason] = useState(choice(defaults.season));
  const [onDate, setOnDate] = useState(defaults.onDate ?? "");

  function apply() {
    const params = filtersToSearchParams({
      side: side === "any" ? undefined : (side as ListingFilters["side"]),
      county: county === "any" ? undefined : county,
      livestockType:
        livestock === "any" ? undefined : (livestock as ListingFilters["livestockType"]),
      landType: landType === "any" ? undefined : (landType as ListingFilters["landType"]),
      season: season === "any" ? undefined : (season as ListingFilters["season"]),
      onDate: onDate || undefined,
    });
    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
    onApplied?.();
  }

  function clear() {
    setSide("any");
    setCounty("any");
    setLivestock("any");
    setLandType("any");
    setSeason("any");
    setOnDate("");
    router.push("/listings");
    onApplied?.();
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
    >
      <div className="grid gap-1.5">
        <Label>Listing side</Label>
        <Select value={side} onValueChange={setSide}>
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
        <Label>Ohio county</Label>
        <Select value={county} onValueChange={setCounty}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any county" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any county</SelectItem>
            {OHIO_COUNTIES.map((item) => (
              <SelectItem key={item.name} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Livestock type</Label>
        <Select value={livestock} onValueChange={setLivestock}>
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
        <Select value={landType} onValueChange={setLandType}>
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
        <Select value={season} onValueChange={setSeason}>
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
        <Label htmlFor="onDate">Available on</Label>
        <Input
          id="onDate"
          type="date"
          value={onDate}
          onChange={(event) => setOnDate(event.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Apply
        </Button>
        <Button type="button" variant="outline" onClick={clear}>
          Clear
        </Button>
      </div>
    </form>
  );
}

export function MobileFilters({ defaults }: { defaults: ListingFilters }) {
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
          <ListingFilters defaults={defaults} onApplied={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
