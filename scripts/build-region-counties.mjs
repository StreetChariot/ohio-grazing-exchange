import { readFileSync, writeFileSync } from "node:fs";

const text = readFileSync(new URL("../src/lib/valley-map-data.ts", import.meta.url), "utf8");
const groups = {
  Kentucky: [],
  Ohio: [],
  Pennsylvania: [],
  "West Virginia": [],
};
const pattern = /"state":"(Kentucky|Ohio|Pennsylvania|West Virginia)","name":"([^"]+)"/g;
for (const match of text.matchAll(pattern)) {
  groups[match[1]].push(match[2].replace(/ County$/, ""));
}

for (const state of Object.keys(groups)) {
  groups[state].sort((a, b) => a.localeCompare(b));
}

const ohioSrc = readFileSync(new URL("../src/lib/counties.ts", import.meta.url), "utf8");
const ohio = [...ohioSrc.matchAll(/name: "([^"]+)"/g)].map((match) => match[1]);
const missing = ohio.filter((name) => !groups.Ohio.includes(name));
const extra = groups.Ohio.filter((name) => !ohio.includes(name));
if (missing.length || extra.length) {
  throw new Error(`Ohio names differ. missing ${missing.join(", ")} extra ${extra.join(", ")}`);
}

const body = `// County names for the four service states. Derived from Census cartographic counties.
// Short names match listing.county (no "County" suffix).

import type { ServiceState } from "./region";

export const COUNTIES_BY_STATE = ${JSON.stringify(groups, null, 2)} as const satisfies Record<ServiceState, readonly string[]>;

export function countiesForState(state: string | null | undefined): readonly string[] {
  if (!state || !(state in COUNTIES_BY_STATE)) return [];
  return COUNTIES_BY_STATE[state as ServiceState];
}

export function isCountyInState(state: string | null | undefined, county: string | null | undefined) {
  if (!state || !county) return false;
  return (countiesForState(state) as readonly string[]).includes(county);
}
`;

writeFileSync(new URL("../src/lib/region-counties.ts", import.meta.url), body);
console.log(Object.fromEntries(Object.entries(groups).map(([state, names]) => [state, names.length])));
