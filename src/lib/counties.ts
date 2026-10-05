export type OhioCounty = {
  name: string;
  latitude: number;
  longitude: number;
};

/** County seats are close enough to place a schematic pin. Not a survey layer. */
export const OHIO_COUNTIES: OhioCounty[] = [
  { name: "Adams", latitude: 38.83, longitude: -83.47 },
  { name: "Allen", latitude: 40.77, longitude: -84.11 },
  { name: "Ashland", latitude: 40.85, longitude: -82.27 },
  { name: "Ashtabula", latitude: 41.89, longitude: -80.74 },
  { name: "Athens", latitude: 39.33, longitude: -82.05 },
  { name: "Auglaize", latitude: 40.56, longitude: -84.22 },
  { name: "Belmont", latitude: 40.02, longitude: -80.99 },
  { name: "Brown", latitude: 38.93, longitude: -83.87 },
  { name: "Butler", latitude: 39.44, longitude: -84.58 },
  { name: "Carroll", latitude: 40.58, longitude: -81.09 },
  { name: "Champaign", latitude: 40.14, longitude: -83.77 },
  { name: "Clark", latitude: 39.92, longitude: -83.78 },
  { name: "Clermont", latitude: 39.05, longitude: -84.15 },
  { name: "Clinton", latitude: 39.41, longitude: -83.81 },
  { name: "Columbiana", latitude: 40.77, longitude: -80.78 },
  { name: "Coshocton", latitude: 40.3, longitude: -81.92 },
  { name: "Crawford", latitude: 40.85, longitude: -82.92 },
  { name: "Cuyahoga", latitude: 41.42, longitude: -81.66 },
  { name: "Darke", latitude: 40.13, longitude: -84.62 },
  { name: "Defiance", latitude: 41.32, longitude: -84.49 },
  { name: "Delaware", latitude: 40.28, longitude: -83.01 },
  { name: "Erie", latitude: 41.36, longitude: -82.63 },
  { name: "Fairfield", latitude: 39.75, longitude: -82.63 },
  { name: "Fayette", latitude: 39.56, longitude: -83.46 },
  { name: "Franklin", latitude: 39.97, longitude: -83.01 },
  { name: "Fulton", latitude: 41.6, longitude: -84.13 },
  { name: "Gallia", latitude: 38.82, longitude: -82.32 },
  { name: "Geauga", latitude: 41.5, longitude: -81.17 },
  { name: "Greene", latitude: 39.69, longitude: -83.89 },
  { name: "Guernsey", latitude: 40.05, longitude: -81.49 },
  { name: "Hamilton", latitude: 39.2, longitude: -84.54 },
  { name: "Hancock", latitude: 41.0, longitude: -83.67 },
  { name: "Hardin", latitude: 40.66, longitude: -83.66 },
  { name: "Harrison", latitude: 40.29, longitude: -81.09 },
  { name: "Henry", latitude: 41.33, longitude: -84.07 },
  { name: "Highland", latitude: 39.18, longitude: -83.6 },
  { name: "Hocking", latitude: 39.5, longitude: -82.48 },
  { name: "Holmes", latitude: 40.56, longitude: -81.93 },
  { name: "Huron", latitude: 41.15, longitude: -82.6 },
  { name: "Jackson", latitude: 39.02, longitude: -82.62 },
  { name: "Jefferson", latitude: 40.38, longitude: -80.76 },
  { name: "Knox", latitude: 40.4, longitude: -82.42 },
  { name: "Lake", latitude: 41.7, longitude: -81.24 },
  { name: "Lawrence", latitude: 38.6, longitude: -82.5 },
  { name: "Licking", latitude: 40.08, longitude: -82.48 },
  { name: "Logan", latitude: 40.39, longitude: -83.77 },
  { name: "Lorain", latitude: 41.3, longitude: -82.15 },
  { name: "Lucas", latitude: 41.68, longitude: -83.5 },
  { name: "Madison", latitude: 39.89, longitude: -83.4 },
  { name: "Mahoning", latitude: 41.02, longitude: -80.76 },
  { name: "Marion", latitude: 40.59, longitude: -83.16 },
  { name: "Medina", latitude: 41.12, longitude: -81.9 },
  { name: "Meigs", latitude: 39.08, longitude: -82.02 },
  { name: "Mercer", latitude: 40.54, longitude: -84.63 },
  { name: "Miami", latitude: 40.05, longitude: -84.23 },
  { name: "Monroe", latitude: 39.73, longitude: -81.08 },
  { name: "Montgomery", latitude: 39.75, longitude: -84.29 },
  { name: "Morgan", latitude: 39.62, longitude: -81.86 },
  { name: "Morrow", latitude: 40.52, longitude: -82.8 },
  { name: "Muskingum", latitude: 39.97, longitude: -81.94 },
  { name: "Noble", latitude: 39.77, longitude: -81.46 },
  { name: "Ottawa", latitude: 41.52, longitude: -83.1 },
  { name: "Paulding", latitude: 41.12, longitude: -84.58 },
  { name: "Perry", latitude: 39.74, longitude: -82.24 },
  { name: "Pickaway", latitude: 39.64, longitude: -83.02 },
  { name: "Pike", latitude: 39.08, longitude: -83.07 },
  { name: "Portage", latitude: 41.17, longitude: -81.2 },
  { name: "Preble", latitude: 39.74, longitude: -84.65 },
  { name: "Putnam", latitude: 41.02, longitude: -84.13 },
  { name: "Richland", latitude: 40.77, longitude: -82.54 },
  { name: "Ross", latitude: 39.33, longitude: -83.06 },
  { name: "Sandusky", latitude: 41.36, longitude: -83.15 },
  { name: "Scioto", latitude: 38.8, longitude: -82.99 },
  { name: "Seneca", latitude: 41.12, longitude: -83.13 },
  { name: "Shelby", latitude: 40.33, longitude: -84.2 },
  { name: "Stark", latitude: 40.81, longitude: -81.37 },
  { name: "Summit", latitude: 41.12, longitude: -81.53 },
  { name: "Trumbull", latitude: 41.32, longitude: -80.76 },
  { name: "Tuscarawas", latitude: 40.45, longitude: -81.47 },
  { name: "Union", latitude: 40.3, longitude: -83.37 },
  { name: "Van Wert", latitude: 40.86, longitude: -84.59 },
  { name: "Vinton", latitude: 39.25, longitude: -82.49 },
  { name: "Warren", latitude: 39.43, longitude: -84.17 },
  { name: "Washington", latitude: 39.46, longitude: -81.49 },
  { name: "Wayne", latitude: 40.83, longitude: -81.89 },
  { name: "Williams", latitude: 41.56, longitude: -84.58 },
  { name: "Wood", latitude: 41.36, longitude: -83.62 },
  { name: "Wyandot", latitude: 40.84, longitude: -83.31 },
];

const byName = new Map(OHIO_COUNTIES.map((county) => [county.name, county]));

export function isOhioCounty(name: string) {
  return byName.has(name);
}

export function countyCentroid(name: string) {
  return byName.get(name) ?? null;
}

export const OHIO_BOUNDS = {
  north: 42.05,
  south: 38.4,
  west: -84.82,
  east: -80.52,
};

export function pinPosition(latitude: number, longitude: number) {
  const x =
    ((longitude - OHIO_BOUNDS.west) / (OHIO_BOUNDS.east - OHIO_BOUNDS.west)) *
    100;
  const y =
    ((OHIO_BOUNDS.north - latitude) / (OHIO_BOUNDS.north - OHIO_BOUNDS.south)) *
    100;
  return {
    left: `${Math.min(96, Math.max(4, x))}%`,
    top: `${Math.min(94, Math.max(6, y))}%`,
  };
}
