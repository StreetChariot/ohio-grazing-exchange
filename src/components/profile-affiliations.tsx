import type { PublicProfile } from "@/lib/community";
import { affiliationItems, roleSummary } from "@/lib/profile-affiliations";
import { AffiliationMarks } from "@/components/affiliation-marks";

export function ProfileAffiliations({ profile }: { profile: PublicProfile }) {
  const roles = roleSummary(profile);
  const items = affiliationItems(profile);

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-sm font-medium">Roles</p>
        <p className="text-sm text-muted-foreground">{roles}</p>
      </div>
      <AffiliationMarks items={items} />
    </div>
  );
}
