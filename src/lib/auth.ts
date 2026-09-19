import { isAllianceSlug, type AllianceSlug } from "@/lib/alliances";
import { isCertifierSlug, type CertifierSlug } from "@/lib/certifiers";
import { coopBySlug, isCoopSlug, type CoopMembership, type CoopMembershipRole } from "@/lib/coops";
import { EMPTY_FARMTEC, farmtecFromRow, type FarmtecSnapshot } from "@/lib/farmtec";
import { parseAffiliationOrgs, type AffiliationOrgSlug } from "@/lib/organizations";
import { isServiceState, type ServiceState } from "@/lib/region";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type Account = {
  id: string;
  email: string | null;
  displayName: string;
  isAdmin: boolean;
  homeState: ServiceState | null;
  homeCounty: string | null;
  allianceSlug: AllianceSlug | null;
  organicCertified: boolean;
  organicCertifier: CertifierSlug | null;
  offersLand: boolean;
  offersLivestock: boolean;
  memberOeffa: boolean;
  memberSare: boolean;
  oeffaCertified: boolean;
  otherCertified: boolean;
  otherCertificationNotes: string | null;
  affiliationOrgs: AffiliationOrgSlug[];
  accreditations: string[];
  avatarUrl: string | null;
  logoUrl: string | null;
  pasturePhotos: string[];
  livestockPhotos: string[];
  coops: CoopMembership[];
  farmtec: FarmtecSnapshot;
};

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/account";
  }
  return value;
}

type ProfileSelect = {
  display_name: string | null;
  role: string | null;
  home_state: string | null;
  home_county: string | null;
  alliance_slug: string | null;
  organic_certified: boolean | null;
  organic_certifier: string | null;
  offers_land: boolean | null;
  offers_livestock: boolean | null;
  member_oeffa: boolean | null;
  member_sare: boolean | null;
  oeffa_certified: boolean | null;
  other_certified: boolean | null;
  other_certification_notes: string | null;
  affiliation_orgs: string[] | null;
  accreditations: string[] | null;
  avatar_url: string | null;
  logo_url: string | null;
  pasture_photos: string[] | null;
  livestock_photos: string[] | null;
};

async function loadCoopsFor(userId: string): Promise<CoopMembership[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_coops")
    .select("coop_slug, membership_role")
    .eq("profile_id", userId);
  const memberships: CoopMembership[] = [];
  for (const row of data ?? []) {
    if (!isCoopSlug(row.coop_slug)) continue;
    const meta = coopBySlug(row.coop_slug);
    if (!meta) continue;
    memberships.push({
      slug: meta.slug,
      name: meta.name,
      role: (row.membership_role as CoopMembershipRole) === "org" ? "org" : "member",
      boardSlug: meta.boardSlug,
    });
  }
  return memberships;
}

export async function getAccount(): Promise<Account | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (typeof sub !== "string") return null;

  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, role, home_state, home_county, alliance_slug, organic_certified, organic_certifier, offers_land, offers_livestock, member_oeffa, member_sare, oeffa_certified, other_certified, other_certification_notes, affiliation_orgs, accreditations, avatar_url, logo_url, pasture_photos, livestock_photos",
    )
    .eq("id", sub)
    .maybeSingle();

  const row = profile as ProfileSelect | null;
  const [coops, farmtecResult] = await Promise.all([
    loadCoopsFor(sub),
    supabase.from("farmtec_snapshots").select("*").eq("profile_id", sub).maybeSingle(),
  ]);

  const farmtec =
    !farmtecResult.error && farmtecResult.data
      ? farmtecFromRow(farmtecResult.data)
      : { ...EMPTY_FARMTEC };

  return {
    id: sub,
    email,
    displayName: row?.display_name || email || "Member",
    isAdmin: row?.role === "admin",
    homeState: isServiceState(row?.home_state) ? row.home_state : null,
    homeCounty: typeof row?.home_county === "string" ? row.home_county : null,
    allianceSlug: isAllianceSlug(row?.alliance_slug) ? row.alliance_slug : null,
    organicCertified: Boolean(row?.organic_certified),
    organicCertifier: isCertifierSlug(row?.organic_certifier) ? row.organic_certifier : null,
    offersLand: Boolean(row?.offers_land),
    offersLivestock: Boolean(row?.offers_livestock),
    memberOeffa: Boolean(row?.member_oeffa),
    memberSare: Boolean(row?.member_sare),
    oeffaCertified: Boolean(row?.oeffa_certified),
    otherCertified: Boolean(row?.other_certified),
    otherCertificationNotes:
      typeof row?.other_certification_notes === "string" ? row.other_certification_notes : null,
    affiliationOrgs: parseAffiliationOrgs(
      Array.isArray(row?.affiliation_orgs) ? row.affiliation_orgs.filter(Boolean) : [],
    ),
    accreditations: Array.isArray(row?.accreditations) ? row.accreditations.filter(Boolean) : [],
    avatarUrl: typeof row?.avatar_url === "string" ? row.avatar_url : null,
    logoUrl: typeof row?.logo_url === "string" ? row.logo_url : null,
    pasturePhotos: Array.isArray(row?.pasture_photos) ? row.pasture_photos.filter(Boolean) : [],
    livestockPhotos: Array.isArray(row?.livestock_photos)
      ? row.livestock_photos.filter(Boolean)
      : [],
    coops,
    farmtec,
  };
}
