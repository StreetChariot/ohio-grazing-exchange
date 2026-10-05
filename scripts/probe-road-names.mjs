import { fileURLToPath } from "node:url";
import { open } from "shapefile";

const shp = fileURLToPath(new URL("./cache/39/tl_2025_39_prisecroads.shp", import.meta.url));
const source = await open(shp, shp.replace(/\.shp$/, ".dbf"));
const samples = { I: new Set(), U: new Set(), S: new Set(), other: new Set() };
let record = await source.read();
let keys = null;
while (!record.done) {
  const props = record.value.properties ?? {};
  keys ??= Object.keys(props);
  const bucket = samples[props.RTTYP] ?? samples.other;
  if (bucket.size < 6) bucket.add(props.FULLNAME ?? "");
  if (samples.I.size >= 6 && samples.U.size >= 6 && samples.S.size >= 6) break;
  record = await source.read();
}
console.log(keys);
for (const [kind, names] of Object.entries(samples)) {
  console.log(kind, [...names]);
}
