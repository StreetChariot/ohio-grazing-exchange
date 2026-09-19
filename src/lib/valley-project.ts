import { geoAlbers } from "d3-geo";
import {
  VALLEY_PARALLELS,
  VALLEY_ROTATE,
  VALLEY_SCALE,
  VALLEY_TRANSLATE,
} from "@/lib/valley-map-data";

const projection = geoAlbers()
  .parallels([VALLEY_PARALLELS[0], VALLEY_PARALLELS[1]])
  .rotate([VALLEY_ROTATE[0], VALLEY_ROTATE[1]])
  .scale(VALLEY_SCALE)
  .translate([VALLEY_TRANSLATE[0], VALLEY_TRANSLATE[1]]);

export function projectValley(longitude: number, latitude: number) {
  const point = projection([longitude, latitude]);
  if (!point) return null;
  return { x: point[0], y: point[1] };
}
