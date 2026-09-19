import { LISTING_MAP_RADIUS_MILES, projectedRadiusMiles } from "@/lib/listing-map";
import { valleyCounties, valleyStates } from "@/lib/valley-map-data";
import type { ListingSide } from "@/lib/types";

const STATE_FILL: Record<string, string> = {
  Ohio: "var(--map-oh)",
  Pennsylvania: "var(--map-pa)",
  Kentucky: "var(--map-ky)",
  "West Virginia": "var(--map-wv)",
};

export function ListingRadiusMap({
  latitude,
  longitude,
  nearestTown,
  state,
  side,
  radiusMiles = LISTING_MAP_RADIUS_MILES,
}: {
  latitude: number;
  longitude: number;
  nearestTown: string;
  state: string;
  side: ListingSide;
  radiusMiles?: number;
}) {
  const projected = projectedRadiusMiles(longitude, latitude, radiusMiles);

  if (!projected) {
    return (
      <div className="listing-visual flex min-h-[14rem] items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
        Map unavailable for this location.
      </div>
    );
  }

  const { center, radius } = projected;
  const pad = Math.max(radius * 1.4, 28);
  const minX = center.x - pad;
  const minY = center.y - pad;
  const size = pad * 2;
  const pinFill = side === "land" ? "var(--color-land)" : "var(--color-herd)";

  return (
    <figure className="listing-visual flex h-full min-h-[14rem] flex-col overflow-hidden rounded-xl border bg-[var(--map-paper)]">
      <svg
        viewBox={`${minX} ${minY} ${size} ${size}`}
        role="img"
        aria-label={`${radiusMiles}-mile radius around ${nearestTown}, ${state}`}
        className="min-h-[14rem] w-full flex-1"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={minX}
          y={minY}
          width={size}
          height={size}
          fill="var(--map-paper)"
        />
        {valleyCounties.map((county) => (
          <path
            key={county.fips}
            d={county.d}
            fill={STATE_FILL[county.state] ?? "var(--map-oh)"}
            stroke="var(--map-county)"
            strokeWidth={0.45}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {valleyStates.map((item) => (
          <path
            key={item.fips}
            d={item.d}
            fill="none"
            stroke="var(--map-state)"
            strokeWidth={1.8}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill={pinFill}
          fillOpacity={0.14}
          stroke={pinFill}
          strokeWidth={1.6}
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={Math.max(2.2, radius * 0.04)}
          fill={pinFill}
          stroke="var(--map-paper)"
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="border-t px-3 py-1.5 text-xs text-muted-foreground">
        {radiusMiles}-mile radius · near {nearestTown}, {state}
      </figcaption>
    </figure>
  );
}
