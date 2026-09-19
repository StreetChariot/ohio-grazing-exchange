import { Badge } from "@/components/ui/badge";
import type { MemberBadge } from "@/lib/badges";

export function MemberBadges({
  badges,
  empty = "No badges yet.",
}: {
  badges: MemberBadge[];
  empty?: string;
}) {
  if (!badges.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <li key={badge.id}>
          <Badge variant="secondary" title={badge.blurb}>
            {badge.name}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
