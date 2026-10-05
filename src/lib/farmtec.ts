/** FarmTec research snapshot — private; anonymized export only with consent. */

export const LIVESTOCK_INTEGRATION_GOALS = [
  "already_100",
  "working_toward_100",
  "partial",
  "not_pursuing",
  "not_applicable",
] as const;

export type LivestockIntegrationGoal = (typeof LIVESTOCK_INTEGRATION_GOALS)[number];

export const FF_PRESSURES = [
  "diesel_fuel",
  "fertilizer_n",
  "plastics",
  "propane_heat",
  "transport",
  "purchased_feed",
  "other",
] as const;

export type FfPressure = (typeof FF_PRESSURES)[number];

export const FF_PRACTICES = [
  "managed_grazing",
  "cover_crops",
  "reduced_till",
  "on_farm_energy",
  "local_supply",
  "electric_tools",
  "animal_hand_power",
  "other",
] as const;

export type FfPractice = (typeof FF_PRACTICES)[number];

export type FarmtecSnapshot = {
  researchConsent: boolean;
  totalAcres: number | null;
  pctRowCrop: number | null;
  pctCoverCrop: number | null;
  pctGrassPasture: number | null;
  pctOtherLand: number | null;
  pctFieldsLivestockGrazed: number | null;
  livestockIntegrationGoal: LivestockIntegrationGoal | null;
  pctOpsFossilFuel: number | null;
  pctOpsElectric: number | null;
  pctOpsPtoTractor: number | null;
  ffPressures: FfPressure[];
  ffPractices: FfPractice[];
  notes: string | null;
  updatedAt: string | null;
};

export const EMPTY_FARMTEC: FarmtecSnapshot = {
  researchConsent: false,
  totalAcres: null,
  pctRowCrop: null,
  pctCoverCrop: null,
  pctGrassPasture: null,
  pctOtherLand: null,
  pctFieldsLivestockGrazed: null,
  livestockIntegrationGoal: null,
  pctOpsFossilFuel: null,
  pctOpsElectric: null,
  pctOpsPtoTractor: null,
  ffPressures: [],
  ffPractices: [],
  notes: null,
  updatedAt: null,
};

export const LIVESTOCK_INTEGRATION_LABELS: Record<LivestockIntegrationGoal, string> = {
  already_100: "Already at (or near) 100% livestock integration",
  working_toward_100: "Working toward 100% livestock integration",
  partial: "Partial integration — not aiming for 100% right now",
  not_pursuing: "Not pursuing livestock integration",
  not_applicable: "Not applicable to this operation",
};

export const FF_PRESSURE_LABELS: Record<FfPressure, string> = {
  diesel_fuel: "Diesel / gasoline for tractors and implements",
  fertilizer_n: "Synthetic nitrogen and other fertilizer",
  plastics: "Plastics (mulch, twine, wrap, irrigation)",
  propane_heat: "Propane / heat / grain drying",
  transport: "Transport and hauling",
  purchased_feed: "Purchased feed",
  other: "Other fossil-linked inputs",
};

export const FF_PRACTICE_LABELS: Record<FfPractice, string> = {
  managed_grazing: "Managed / rotational livestock grazing",
  cover_crops: "Cover crops in the rotation",
  reduced_till: "Reduced or no-till",
  on_farm_energy: "On-farm energy (solar, biofuels, etc.)",
  local_supply: "Shorter / local supply chains",
  electric_tools: "Electric or battery implements",
  animal_hand_power: "Animal power or hand labor for some tasks",
  other: "Other fossil-fuel reduction practices",
};

export function isLivestockIntegrationGoal(
  value: string | null | undefined,
): value is LivestockIntegrationGoal {
  return Boolean(value && (LIVESTOCK_INTEGRATION_GOALS as readonly string[]).includes(value));
}

export function isFfPressure(value: string): value is FfPressure {
  return (FF_PRESSURES as readonly string[]).includes(value);
}

export function isFfPractice(value: string): value is FfPractice {
  return (FF_PRACTICES as readonly string[]).includes(value);
}

export function parsePct(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return Math.round(n);
}

export function parseAcres(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 10) / 10;
}

export type FarmtecRow = {
  profile_id?: string;
  research_consent: boolean | null;
  total_acres: number | string | null;
  pct_row_crop: number | null;
  pct_cover_crop: number | null;
  pct_grass_pasture: number | null;
  pct_other_land: number | null;
  pct_fields_livestock_grazed: number | null;
  livestock_integration_goal: string | null;
  pct_ops_fossil_fuel: number | null;
  pct_ops_electric: number | null;
  pct_ops_pto_tractor: number | null;
  ff_pressures: string[] | null;
  ff_practices: string[] | null;
  notes: string | null;
  updated_at: string | null;
};

function asPct(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (value < 0 || value > 100) return null;
  return Math.round(value);
}

function asAcres(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 10) / 10;
}

export function farmtecFromRow(row: FarmtecRow | null | undefined): FarmtecSnapshot {
  if (!row) return { ...EMPTY_FARMTEC };
  return {
    researchConsent: Boolean(row.research_consent),
    totalAcres: asAcres(row.total_acres),
    pctRowCrop: asPct(row.pct_row_crop),
    pctCoverCrop: asPct(row.pct_cover_crop),
    pctGrassPasture: asPct(row.pct_grass_pasture),
    pctOtherLand: asPct(row.pct_other_land),
    pctFieldsLivestockGrazed: asPct(row.pct_fields_livestock_grazed),
    livestockIntegrationGoal: isLivestockIntegrationGoal(row.livestock_integration_goal)
      ? row.livestock_integration_goal
      : null,
    pctOpsFossilFuel: asPct(row.pct_ops_fossil_fuel),
    pctOpsElectric: asPct(row.pct_ops_electric),
    pctOpsPtoTractor: asPct(row.pct_ops_pto_tractor),
    ffPressures: Array.isArray(row.ff_pressures)
      ? row.ff_pressures.filter(isFfPressure)
      : [],
    ffPractices: Array.isArray(row.ff_practices)
      ? row.ff_practices.filter(isFfPractice)
      : [],
    notes: typeof row.notes === "string" && row.notes.trim() ? row.notes.trim() : null,
    updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

export function farmtecToRow(snapshot: Omit<FarmtecSnapshot, "updatedAt">) {
  return {
    research_consent: snapshot.researchConsent,
    total_acres: snapshot.totalAcres,
    pct_row_crop: snapshot.pctRowCrop,
    pct_cover_crop: snapshot.pctCoverCrop,
    pct_grass_pasture: snapshot.pctGrassPasture,
    pct_other_land: snapshot.pctOtherLand,
    pct_fields_livestock_grazed: snapshot.pctFieldsLivestockGrazed,
    livestock_integration_goal: snapshot.livestockIntegrationGoal,
    pct_ops_fossil_fuel: snapshot.pctOpsFossilFuel,
    pct_ops_electric: snapshot.pctOpsElectric,
    pct_ops_pto_tractor: snapshot.pctOpsPtoTractor,
    ff_pressures: snapshot.ffPressures,
    ff_practices: snapshot.ffPractices,
    notes: snapshot.notes,
  };
}

export type FarmtecRollup = {
  consentedCount: number;
  avgTotalAcres: number | null;
  avgPctRowCrop: number | null;
  avgPctCoverCrop: number | null;
  avgPctGrassPasture: number | null;
  avgPctOtherLand: number | null;
  avgPctFieldsLivestockGrazed: number | null;
  avgPctOpsFossilFuel: number | null;
  avgPctOpsElectric: number | null;
  avgPctOpsPtoTractor: number | null;
  integrationGoalCounts: Record<LivestockIntegrationGoal, number>;
  pressureCounts: Record<FfPressure, number>;
  practiceCounts: Record<FfPractice, number>;
};

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function rollupFarmtec(snapshots: FarmtecSnapshot[]): FarmtecRollup {
  const consented = snapshots.filter((s) => s.researchConsent);
  const emptyGoals = Object.fromEntries(
    LIVESTOCK_INTEGRATION_GOALS.map((g) => [g, 0]),
  ) as Record<LivestockIntegrationGoal, number>;
  const emptyPressures = Object.fromEntries(FF_PRESSURES.map((p) => [p, 0])) as Record<
    FfPressure,
    number
  >;
  const emptyPractices = Object.fromEntries(FF_PRACTICES.map((p) => [p, 0])) as Record<
    FfPractice,
    number
  >;

  for (const s of consented) {
    if (s.livestockIntegrationGoal) emptyGoals[s.livestockIntegrationGoal] += 1;
    for (const p of s.ffPressures) emptyPressures[p] += 1;
    for (const p of s.ffPractices) emptyPractices[p] += 1;
  }

  const pick = (fn: (s: FarmtecSnapshot) => number | null) =>
    consented.map(fn).filter((n): n is number => n != null);

  return {
    consentedCount: consented.length,
    avgTotalAcres: avg(pick((s) => s.totalAcres)),
    avgPctRowCrop: avg(pick((s) => s.pctRowCrop)),
    avgPctCoverCrop: avg(pick((s) => s.pctCoverCrop)),
    avgPctGrassPasture: avg(pick((s) => s.pctGrassPasture)),
    avgPctOtherLand: avg(pick((s) => s.pctOtherLand)),
    avgPctFieldsLivestockGrazed: avg(pick((s) => s.pctFieldsLivestockGrazed)),
    avgPctOpsFossilFuel: avg(pick((s) => s.pctOpsFossilFuel)),
    avgPctOpsElectric: avg(pick((s) => s.pctOpsElectric)),
    avgPctOpsPtoTractor: avg(pick((s) => s.pctOpsPtoTractor)),
    integrationGoalCounts: emptyGoals,
    pressureCounts: emptyPressures,
    practiceCounts: emptyPractices,
  };
}
