"use client";

import {
  FF_PRACTICES,
  FF_PRACTICE_LABELS,
  FF_PRESSURES,
  FF_PRESSURE_LABELS,
  LIVESTOCK_INTEGRATION_GOALS,
  LIVESTOCK_INTEGRATION_LABELS,
  type FarmtecSnapshot,
} from "@/lib/farmtec";
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
import { useState } from "react";

function PctField({
  id,
  name,
  label,
  hint,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  defaultValue: number | null;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        min={0}
        max={100}
        step={1}
        inputMode="numeric"
        defaultValue={defaultValue ?? ""}
        placeholder="0–100"
      />
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function FarmtecFields({ farmtec }: { farmtec: FarmtecSnapshot }) {
  const [goal, setGoal] = useState(farmtec.livestockIntegrationGoal ?? "");
  const pressureSet = new Set(farmtec.ffPressures);
  const practiceSet = new Set(farmtec.ffPractices);

  return (
    <fieldset className="grid gap-4">
      <legend className="text-sm font-medium">FarmTec research snapshot</legend>
      <p className="text-sm text-muted-foreground">
        Optional. Rough operation stats for OSU Extension (Wooster) and the
        Stinner Summit fossil-fuel reduction mission. Not shown on your public
        profile. Check consent below only if you allow anonymized research use.
      </p>

      <label className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm">
        <input
          type="checkbox"
          name="farmtecResearchConsent"
          value="yes"
          defaultChecked={farmtec.researchConsent}
          className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
        />
        <span>
          <span className="font-medium text-foreground">
            Share anonymized answers for research
          </span>
          <span className="mt-0.5 block text-muted-foreground">
            OSU Extension (Wooster) and Stinner Summit partners may use
            aggregated figures to design fossil-fuel reduction solutions. Your
            name and contact stay private.
          </span>
        </span>
      </label>

      <div className="grid gap-1.5">
        <Label htmlFor="farmtecTotalAcres">Total acres managed</Label>
        <Input
          id="farmtecTotalAcres"
          name="farmtecTotalAcres"
          type="number"
          min={0}
          max={100000}
          step={0.1}
          inputMode="decimal"
          defaultValue={farmtec.totalAcres ?? ""}
          placeholder="e.g. 120"
        />
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">
          Land-use spread (% of managed acres)
        </p>
        <p className="text-sm text-muted-foreground">
          Rough share of row crops, cover crops, grass/pasture/hay, and other
          (woods, buildings, etc.). Approximate is fine; need not sum to 100.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <PctField
            id="farmtecPctRow"
            name="farmtecPctRowCrop"
            label="Row crops %"
            defaultValue={farmtec.pctRowCrop}
          />
          <PctField
            id="farmtecPctCover"
            name="farmtecPctCoverCrop"
            label="Cover crops %"
            defaultValue={farmtec.pctCoverCrop}
          />
          <PctField
            id="farmtecPctGrass"
            name="farmtecPctGrassPasture"
            label="Grass / pasture / hay %"
            defaultValue={farmtec.pctGrassPasture}
          />
          <PctField
            id="farmtecPctOther"
            name="farmtecPctOtherLand"
            label="Other land %"
            defaultValue={farmtec.pctOtherLand}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <PctField
          id="farmtecPctGrazed"
          name="farmtecPctFieldsLivestockGrazed"
          label="% of pastures / fields on livestock (manual) grazing"
          hint="Share of your acres where livestock do the grazing work — not just mechanical harvest."
          defaultValue={farmtec.pctFieldsLivestockGrazed}
        />
        <div className="grid gap-1.5">
          <Label>Livestock integration goal</Label>
          <input type="hidden" name="farmtecLivestockIntegrationGoal" value={goal} />
          <Select
            value={goal || "unset"}
            onValueChange={(value) => setGoal(value === "unset" ? "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set</SelectItem>
              {LIVESTOCK_INTEGRATION_GOALS.map((key) => (
                <SelectItem key={key} value={key}>
                  {LIVESTOCK_INTEGRATION_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">
          Field operations energy / equipment mix (%)
        </p>
        <p className="text-sm text-muted-foreground">
          Approximate share of annual field work. Categories can overlap (e.g.
          diesel tractor work that is also PTO-driven).
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <PctField
            id="farmtecPctFossil"
            name="farmtecPctOpsFossilFuel"
            label="Fossil fuel %"
            hint="Diesel / gas tractors & implements"
            defaultValue={farmtec.pctOpsFossilFuel}
          />
          <PctField
            id="farmtecPctElectric"
            name="farmtecPctOpsElectric"
            label="Electric %"
            hint="Battery / corded implements"
            defaultValue={farmtec.pctOpsElectric}
          />
          <PctField
            id="farmtecPctPto"
            name="farmtecPctOpsPtoTractor"
            label="PTO / tractor %"
            hint="Work that depends on PTO or tractor"
            defaultValue={farmtec.pctOpsPtoTractor}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">
          Where fossil-fuel costs hit hardest
        </p>
        {FF_PRESSURES.map((key) => (
          <label
            key={key}
            className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm"
          >
            <input
              type="checkbox"
              name="farmtecFfPressures"
              value={key}
              defaultChecked={pressureSet.has(key)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
            />
            <span className="font-medium text-foreground">{FF_PRESSURE_LABELS[key]}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-medium text-foreground">
          Practices already cutting fossil reliance
        </p>
        {FF_PRACTICES.map((key) => (
          <label
            key={key}
            className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm"
          >
            <input
              type="checkbox"
              name="farmtecFfPractices"
              value={key}
              defaultChecked={practiceSet.has(key)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
            />
            <span className="font-medium text-foreground">{FF_PRACTICE_LABELS[key]}</span>
          </label>
        ))}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="farmtecNotes">Notes for researchers (optional)</Label>
        <Textarea
          id="farmtecNotes"
          name="farmtecNotes"
          rows={3}
          maxLength={800}
          defaultValue={farmtec.notes ?? ""}
          placeholder="Constraints, ideas, or equipment you wish existed…"
        />
      </div>
    </fieldset>
  );
}
