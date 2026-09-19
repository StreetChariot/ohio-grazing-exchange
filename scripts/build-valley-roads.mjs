// Census TIGER 2025 primary and secondary roads, projected with the valley map.
// Writes public/valley-roads.json. Local geometry only. No tile service.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { geoAlbers } from "d3-geo";
import { open } from "shapefile";

const WIDTH = 1000;
const HEIGHT = 560;
const FIPS = ["21", "39", "42", "54"];
const KINDS = ["interstate", "us", "state"];
const TOLERANCE = { interstate: 0.35, us: 0.6, state: 1.15 };
const LABEL_SPACING = { interstate: 150, us: 110, state: 80 };
const LABEL_GAP = { interstate: 120, us: 90, state: 55 };

const mapSource = await readFile(new URL("../src/lib/valley-map-data.ts", import.meta.url), "utf8");
const scale = Number(mapSource.match(/VALLEY_SCALE = ([0-9.]+)/)[1]);
const translate = mapSource
  .match(/VALLEY_TRANSLATE = \[([0-9.]+), ([0-9.]+)\]/)
  .slice(1)
  .map(Number);

const projection = geoAlbers()
  .parallels([37, 41.5])
  .rotate([82.5, 0])
  .scale(scale)
  .translate(translate);

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const limit = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [start, end] = stack.pop();
    const a = points[start];
    const b = points[end];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = dx * dx + dy * dy;
    let max = 0;
    let index = -1;
    for (let i = start + 1; i < end; i++) {
      const p = points[i];
      let dsq;
      if (len === 0) {
        dsq = (p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2;
      } else {
        let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        dsq = (p[0] - (a[0] + t * dx)) ** 2 + (p[1] - (a[1] + t * dy)) ** 2;
      }
      if (dsq > max) {
        max = dsq;
        index = i;
      }
    }
    if (max > limit && index !== -1) {
      keep[index] = 1;
      stack.push([start, index], [index, end]);
    }
  }
  const out = [];
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i]);
  return out;
}

function projectLine(coordinates, tolerance) {
  const points = [];
  for (const pair of coordinates) {
    const projected = projection(pair);
    if (!projected) continue;
    const x = projected[0];
    const y = projected[1];
    if (x < -30 || x > WIDTH + 30 || y < -30 || y > HEIGHT + 30) continue;
    points.push([x, y]);
  }
  if (points.length < 2) return null;
  const simplified = simplify(points, tolerance);
  return simplified.length >= 2 ? simplified : null;
}

function kindOf(rttyp) {
  if (rttyp === "I") return "interstate";
  if (rttyp === "U") return "us";
  if (rttyp === "S") return "state";
  return null;
}

function shield(fullName, kind) {
  const compact = String(fullName ?? "").replace(/\s+/g, " ").trim();
  if (!compact || /ramp/i.test(compact)) return null;
  if (kind === "interstate") {
    const match = compact.match(/I-?\s*(\d+)/i);
    return match ? `I-${match[1]}` : null;
  }
  if (kind === "us") {
    const match = compact.match(/(\d+)/);
    return match ? `US ${match[1]}` : null;
  }
  const match = compact.match(/(\d+)/);
  return match ? match[1] : null;
}

function lengthOf(line) {
  let total = 0;
  for (let i = 1; i < line.length; i++) {
    total += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
  }
  return total;
}

function pointAt(line, distance) {
  let left = distance;
  for (let i = 1; i < line.length; i++) {
    const dx = line[i][0] - line[i - 1][0];
    const dy = line[i][1] - line[i - 1][1];
    const dist = Math.hypot(dx, dy);
    if (left <= dist || i === line.length - 1) {
      const t = dist === 0 ? 0 : Math.min(1, left / dist);
      return [line[i - 1][0] + dx * t, line[i - 1][1] + dy * t];
    }
    left -= dist;
  }
  return line[0];
}

function labelsFor(kind) {
  const labels = [];
  const spacing = LABEL_SPACING[kind];
  for (const [name, parts] of routeNames[kind]) {
    let cursor = spacing * 0.4;
    let placed = 0;
    for (const line of parts) {
      const len = lengthOf(line);
      if (len === 0) continue;
      while (cursor <= len) {
        const [x, y] = pointAt(line, cursor);
        labels.push({ kind, name, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
        placed += 1;
        cursor += spacing;
      }
      cursor -= len;
    }
    if (placed === 0 && parts.length) {
      const longest = parts.reduce((best, line) => (lengthOf(line) > lengthOf(best) ? line : best));
      const [x, y] = pointAt(longest, lengthOf(longest) / 2);
      labels.push({ kind, name, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) });
    }
  }
  return labels;
}

const lines = { interstate: [], us: [], state: [] };
const seen = new Set();
const counts = { interstate: 0, us: 0, state: 0, skipped: 0 };
const routeNames = { interstate: new Map(), us: new Map(), state: new Map() };

for (const fips of FIPS) {
  const shp = fileURLToPath(new URL(`./cache/${fips}/tl_2025_${fips}_prisecroads.shp`, import.meta.url));
  const source = await open(shp, shp.replace(/\.shp$/, ".dbf"));
  let record = await source.read();
  let readCount = 0;
  while (!record.done) {
    const feature = record.value;
    const props = feature.properties ?? {};
    const id = props.LINEARID;
    const fullName = String(props.FULLNAME ?? "");
    const kind = /ramp/i.test(fullName) ? null : kindOf(props.RTTYP);
    if (!kind || (id && seen.has(id))) {
      counts.skipped += 1;
    } else {
      if (id) seen.add(id);
      const geometry = feature.geometry;
      const parts =
        geometry?.type === "LineString"
          ? [geometry.coordinates]
          : geometry?.type === "MultiLineString"
            ? geometry.coordinates
            : [];
      const drawn = [];
      for (const part of parts) {
        const line = projectLine(part, TOLERANCE[kind]);
        if (!line) continue;
        lines[kind].push(line);
        drawn.push(line);
      }
      if (drawn.length) {
        counts[kind] += 1;
        const name = shield(props.FULLNAME, kind);
        if (name) {
          const bucket = routeNames[kind].get(name) ?? [];
          bucket.push(...drawn);
          routeNames[kind].set(name, bucket);
        }
      } else {
        counts.skipped += 1;
      }
    }
    record = await source.read();
    readCount += 1;
    if (readCount % 25000 === 0) console.log(`${fips} ${readCount}`);
  }
  console.log(`read ${fips} ${readCount}`);
}

function toPath(parts) {
  let path = "";
  for (const line of parts) {
    path += `M${line[0][0].toFixed(1)} ${line[0][1].toFixed(1)}`;
    for (let i = 1; i < line.length; i++) {
      path += `L${line[i][0].toFixed(1)} ${line[i][1].toFixed(1)}`;
    }
  }
  return path;
}

function labelsFor(kind) {
  const labels = [];
  const occupied = [];
  const gap = LABEL_GAP[kind];
  for (const [name, parts] of routeNames[kind]) {
    for (const line of parts) {
      for (const [x, y] of sample(line, LABEL_SPACING[kind])) {
        if (occupied.some((other) => other.name === name && Math.hypot(other.x - x, other.y - y) < gap)) {
          continue;
        }
        const label = { kind, name, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
        occupied.push(label);
        labels.push(label);
      }
    }
  }
  return labels;
}

const roads = {
  interstate: toPath(lines.interstate),
  us: toPath(lines.us),
  state: toPath(lines.state),
  labels: [...labelsFor("interstate"), ...labelsFor("us"), ...labelsFor("state")],
};

const target = new URL("../public/valley-roads.json", import.meta.url);
await writeFile(target, JSON.stringify(roads));
const bytes = Buffer.byteLength(JSON.stringify(roads));
console.log(counts);
console.log(
  `paths I ${roads.interstate.length} U ${roads.us.length} S ${roads.state.length} labels ${roads.labels.length} bytes ${bytes}`,
);
