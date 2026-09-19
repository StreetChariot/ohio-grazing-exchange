"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIDE_LABELS } from "@/lib/labels";
import { projectValley } from "@/lib/valley-project";
import {
  VALLEY_HEIGHT,
  VALLEY_WIDTH,
  valleyCounties,
  valleyStates,
} from "@/lib/valley-map-data";
import type { Listing } from "@/lib/types";

const STATE_FILL: Record<(typeof valleyStates)[number]["name"], string> = {
  Ohio: "var(--map-oh)",
  Pennsylvania: "var(--map-pa)",
  Kentucky: "var(--map-ky)",
  "West Virginia": "var(--map-wv)",
};

type View = { x: number; y: number; k: number };

type RoadFile = {
  interstate: string;
  us: string;
  state: string;
};

const usRoadZoom = 2.6;
const stateRoadZoom = 3.6;

type Layers = {
  counties: boolean;
  interstate: boolean;
};

const minZoom = 1;
const maxZoom = 8;

function pathRings(d: string) {
  const rings: [number, number][][] = [];
  for (const part of d.split(/(?=M)/)) {
    const nums = part.match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 6) continue;
    const ring: [number, number][] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      ring.push([Number(nums[i]), Number(nums[i + 1])]);
    }
    rings.push(ring);
  }
  return rings;
}

function ringCross(ring: [number, number][]) {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
}

function contains(ring: [number, number][], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function interiorPoint(d: string) {
  const rings = pathRings(d);
  if (!rings.length) return null;
  const ring = rings.reduce((best, item) =>
    Math.abs(ringCross(item)) > Math.abs(ringCross(best)) ? item : best,
  );
  const cross = ringCross(ring);
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    const step = x1 * y2 - x2 * y1;
    cx += (x1 + x2) * step;
    cy += (y1 + y2) * step;
  }
  const center =
    Math.abs(cross) < 1e-6
      ? {
          x: ring.reduce((sum, point) => sum + point[0], 0) / ring.length,
          y: ring.reduce((sum, point) => sum + point[1], 0) / ring.length,
        }
      : { x: cx / (3 * cross), y: cy / (3 * cross) };
  if (contains(ring, center.x, center.y)) return center;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  let nearest: { x: number; y: number; score: number } | null = null;
  for (let gy = 1; gy <= 8; gy++) {
    for (let gx = 1; gx <= 8; gx++) {
      const x = minX + ((maxX - minX) * gx) / 9;
      const y = minY + ((maxY - minY) * gy) / 9;
      if (!contains(ring, x, y)) continue;
      const score = Math.hypot(x - center.x, y - center.y);
      if (!nearest || score < nearest.score) nearest = { x, y, score };
    }
  }
  return nearest ?? center;
}

const countyLabels = valleyCounties.flatMap((county) => {
  const point = interiorPoint(county.d);
  if (!point) return [];
  return [{ ...point, name: county.name.replace(/ County$/, ""), fips: county.fips }];
});

function clampView(next: View): View {
  const k = Math.min(maxZoom, Math.max(minZoom, next.k));
  const minX = VALLEY_WIDTH * (1 - k);
  const minY = VALLEY_HEIGHT * (1 - k);
  return {
    k,
    x: Math.min(0, Math.max(minX, next.x)),
    y: Math.min(0, Math.max(minY, next.y)),
  };
}

export function ValleyMap({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [roads, setRoads] = useState<RoadFile | null>(null);
  const [layers, setLayers] = useState<Layers>({
    counties: true,
    interstate: true,
  });
  const viewRef = useRef(view);
  viewRef.current = view;
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);

  function clientToSvg(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const mapped = point.matrixTransform(matrix.inverse());
    return { x: mapped.x, y: mapped.y };
  }

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const current = viewRef.current;
    const nextK = Math.min(maxZoom, Math.max(minZoom, current.k * factor));
    const point = clientToSvg(clientX, clientY);
    setView(
      clampView({
        k: nextK,
        x: point.x - ((point.x - current.x) * nextK) / current.k,
        y: point.y - ((point.y - current.y) * nextK) / current.k,
      }),
    );
  }

  const zoomAtRef = useRef(zoomAt);
  zoomAtRef.current = zoomAt;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
      zoomAtRef.current(event.clientX, event.clientY, factor);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    let cancel = false;
    fetch("/valley-roads.json")
      .then((response) => {
        if (!response.ok) throw new Error("roads");
        return response.json() as Promise<RoadFile>;
      })
      .then((data) => {
        if (!cancel) setRoads(data);
      })
      .catch(() => {
        if (!cancel) setRoads(null);
      });
    return () => {
      cancel = true;
    };
  }, []);

  function zoomFromCenter(factor: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  return (
    <section aria-label="Map of listings in the Ohio Valley" className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-medium">Ohio Valley</h2>
          <p className="text-sm text-muted-foreground">
            State color and a heavy outline, thin county lines, and blue
            interstates. US and state highways appear once you zoom in. Scroll
            to zoom. Pins open a listing.
          </p>
        </div>
        <div className="hidden gap-3 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-land" /> Land
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-herd" /> Livestock
          </span>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-black/8 bg-[var(--map-paper)]/80 shadow-[inset_0_1px_0_oklch(1_0_0/0.45)] backdrop-blur-sm">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VALLEY_WIDTH} ${VALLEY_HEIGHT}`}
          role="img"
          aria-label="County map of Ohio, Pennsylvania, Kentucky, and West Virginia"
          className="h-auto w-full touch-none cursor-grab select-none active:cursor-grabbing"
          onPointerDown={(event) => {
            if ((event.target as Element).closest("a, button, [role='link']")) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = {
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              ox: viewRef.current.x,
              oy: viewRef.current.y,
            };
          }}
          onPointerMove={(event) => {
            const active = drag.current;
            if (!active || active.pointerId !== event.pointerId) return;
            const start = clientToSvg(active.x, active.y);
            const now = clientToSvg(event.clientX, event.clientY);
            setView(
              clampView({
                ...viewRef.current,
                x: active.ox + (now.x - start.x),
                y: active.oy + (now.y - start.y),
              }),
            );
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onDoubleClick={(event) => {
            if ((event.target as Element).closest("a, [role='link']")) return;
            zoomAt(event.clientX, event.clientY, 1.6);
          }}
        >
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {valleyCounties.map((county) => (
              <path
                key={county.fips}
                d={county.d}
                fill={STATE_FILL[county.state]}
                stroke="var(--map-county)"
                strokeWidth={0.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              >
                <title>{`${county.name}, ${county.state}`}</title>
              </path>
            ))}
            {view.k >= stateRoadZoom && roads?.state ? (
              <RoadStroke d={roads.state} color="var(--map-state-road)" width={0.7} />
            ) : null}
            {view.k >= usRoadZoom && roads?.us ? (
              <RoadStroke d={roads.us} color="var(--map-us)" width={1.05} />
            ) : null}
            {layers.interstate && roads?.interstate ? (
              <RoadStroke d={roads.interstate} color="var(--map-interstate)" width={2.6} />
            ) : null}
            {valleyStates.map((state) => (
              <path
                key={state.fips}
                d={state.d}
                fill="none"
                stroke="var(--map-state)"
                strokeWidth={3.4}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            ))}
            {layers.counties
              ? countyLabels.map((label) => (
                  <text
                    key={label.fips}
                    x={label.x}
                    y={label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={5.2}
                    fontWeight={500}
                    fill="var(--map-label)"
                    stroke="var(--map-paper)"
                    strokeWidth={0.7}
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {label.name}
                  </text>
                ))
              : null}
            {listings.map((listing) => {
              const point = projectValley(listing.longitude, listing.latitude);
              if (!point) return null;
              return (
                <g
                  key={listing.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${SIDE_LABELS[listing.side]} in ${listing.county} County, ${listing.state}: ${listing.title}`}
                  transform={`translate(${point.x} ${point.y}) scale(${1 / view.k})`}
                  className="cursor-pointer"
                  onClick={() => router.push(`/listings/${listing.id}`)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    router.push(`/listings/${listing.id}`);
                  }}
                >
                  <title>
                    {`${SIDE_LABELS[listing.side]} · ${listing.county} County, ${listing.state}: ${listing.title}`}
                  </title>
                  <circle r={12} fill="transparent" />
                  <circle
                    r={6}
                    fill={listing.side === "land" ? "var(--land)" : "var(--herd)"}
                    stroke="var(--background)"
                    strokeWidth={1.25}
                    fillOpacity={0.9}
                  />
                </g>
              );
            })}
          </g>
        </svg>
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="bg-background/90"
            aria-label="Zoom in"
            onClick={() => zoomFromCenter(1.35)}
          >
            <Plus />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="bg-background/90"
            aria-label="Zoom out"
            onClick={() => zoomFromCenter(1 / 1.35)}
          >
            <Minus />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            className="bg-background/90"
            aria-label="Reset map"
            onClick={() => setView({ x: 0, y: 0, k: 1 })}
          >
            <RotateCcw />
          </Button>
        </div>
        {listings.length === 0 ? (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-sm text-muted-foreground">
            No pins for this filter.
          </p>
        ) : null}
      </div>
      <ul className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {(
          [
            ["counties", "County names"],
            ["interstate", "Interstate"],
          ] as const
        ).map(([key, label]) => (
          <li key={key}>
            <button
              type="button"
              aria-pressed={layers[key]}
              className={`rounded-full border px-2.5 py-1 ${
                layers[key]
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground"
              }`}
              onClick={() => setLayers((current) => ({ ...current, [key]: !current[key] }))}
            >
              {label}
            </button>
          </li>
        ))}
        {valleyStates.map((state) => (
          <li key={state.fips} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-sm border border-[var(--map-state)]"
              style={{ background: STATE_FILL[state.name] }}
            />
            {state.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RoadStroke({
  d,
  color,
  width,
}: {
  d: string;
  color: string;
  width: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      pointerEvents="none"
    />
  );
}
