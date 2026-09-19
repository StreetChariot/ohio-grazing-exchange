export type BadgeId =
  | "valley-member"
  | "alliance-hand"
  | "first-graze"
  | "land-host"
  | "grazier-5"
  | "grazier-10"
  | "host-5"
  | "host-10"
  | "both-sides"
  | "valley-regular";

export type MemberBadge = {
  id: BadgeId;
  name: string;
  blurb: string;
};

export type BadgeCounts = {
  grazedCount: number;
  hostedCount: number;
  hasAlliance: boolean;
  isMember: boolean;
};

export const BADGE_CATALOG: MemberBadge[] = [
  {
    id: "valley-member",
    name: "Valley member",
    blurb: "Free account on the exchange.",
  },
  {
    id: "alliance-hand",
    name: "Alliance hand",
    blurb: "Named a home county and joined a quadrant alliance.",
  },
  {
    id: "first-graze",
    name: "First graze",
    blurb: "One confirmed graze with livestock.",
  },
  {
    id: "land-host",
    name: "Land host",
    blurb: "One confirmed graze on your land.",
  },
  {
    id: "grazier-5",
    name: "Grazier (5)",
    blurb: "Five confirmed grazes with livestock.",
  },
  {
    id: "grazier-10",
    name: "Grazier (10)",
    blurb: "Ten confirmed grazes with livestock.",
  },
  {
    id: "host-5",
    name: "Host (5)",
    blurb: "Five confirmed grazes on your land.",
  },
  {
    id: "host-10",
    name: "Host (10)",
    blurb: "Ten confirmed grazes on your land.",
  },
  {
    id: "both-sides",
    name: "Both sides",
    blurb: "Confirmed at least once as land and as livestock.",
  },
  {
    id: "valley-regular",
    name: "Valley regular",
    blurb: "Three confirmed grazes, either side.",
  },
];

const byId = new Map(BADGE_CATALOG.map((badge) => [badge.id, badge]));

export function badgeById(id: BadgeId) {
  return byId.get(id) ?? null;
}

export function reputationScore(counts: Pick<BadgeCounts, "grazedCount" | "hostedCount">) {
  return counts.grazedCount + counts.hostedCount;
}

export function earnedBadges(counts: BadgeCounts): MemberBadge[] {
  const earned: BadgeId[] = [];
  if (counts.isMember) earned.push("valley-member");
  if (counts.hasAlliance) earned.push("alliance-hand");
  if (counts.grazedCount >= 1) earned.push("first-graze");
  if (counts.hostedCount >= 1) earned.push("land-host");
  if (counts.grazedCount >= 5) earned.push("grazier-5");
  if (counts.grazedCount >= 10) earned.push("grazier-10");
  if (counts.hostedCount >= 5) earned.push("host-5");
  if (counts.hostedCount >= 10) earned.push("host-10");
  if (counts.grazedCount >= 1 && counts.hostedCount >= 1) earned.push("both-sides");
  if (counts.grazedCount + counts.hostedCount >= 3) earned.push("valley-regular");
  return earned.map((id) => byId.get(id)).filter((badge): badge is MemberBadge => Boolean(badge));
}
