import {
  Building2,
  Compass,
  Fence,
  Leaf,
  Mountain,
  Sparkles,
  SunMedium,
  Trees,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";

export type ForumBoardIconKey =
  | "valley"
  | "northwest"
  | "northeast"
  | "southwest"
  | "southeast"
  | "coop"
  | "stinner"
  | "stinner-chosen"
  | "default";

const BOARD_ICONS: Record<ForumBoardIconKey, LucideIcon> = {
  valley: Fence,
  northwest: Waves,
  northeast: Compass,
  southwest: Leaf,
  southeast: Mountain,
  coop: Building2,
  stinner: SunMedium,
  "stinner-chosen": Sparkles,
  default: Trees,
};

export function forumBoardIconKey(
  slug: string,
  privateLane = false,
  laneKind: string | null = null,
): ForumBoardIconKey {
  if (privateLane || slug.startsWith("coop-")) return "coop";
  if (laneKind === "chosen-projects" || slug.includes("chosen")) return "stinner-chosen";
  if (slug.startsWith("stinner-") || laneKind === "year") return "stinner";
  if (slug in BOARD_ICONS) return slug as ForumBoardIconKey;
  return "default";
}

export function forumBoardIcon(
  slug: string,
  privateLane = false,
  laneKind: string | null = null,
) {
  return BOARD_ICONS[forumBoardIconKey(slug, privateLane, laneKind)] ?? Users;
}

export const FORUM_EMOJI = [
  "😀",
  "🙂",
  "😂",
  "🙏",
  "👍",
  "👏",
  "💪",
  "🌱",
  "🌿",
  "🌾",
  "🐄",
  "🐑",
  "🐐",
  "🐴",
  "🚜",
  "☀️",
  "🌧️",
  "✅",
  "❓",
  "💡",
] as const;
