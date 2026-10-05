import { ALLIANCES, allianceForListing, isAllianceSlug, type AllianceSlug } from "./alliances";
import { earnedBadges, reputationScore, type MemberBadge } from "./badges";
import { isCertifierSlug, type CertifierSlug } from "./certifiers";
import { coopBySlug, isCoopSlug, type CoopMembership, type CoopMembershipRole, type CoopSlug } from "./coops";
import {
  farmtecFromRow,
  farmtecToRow,
  rollupFarmtec,
  type FarmtecSnapshot,
  type FarmtecRollup,
} from "./farmtec";
import { organicGrazeBlockReason } from "./organic";
import { listListings } from "./listings";
import { parseAffiliationOrgs, type AffiliationOrgSlug } from "./organizations";
import { isServiceState, type ServiceState } from "./region";
import { isSupabaseConfigured } from "./supabase/env";
import { createClient } from "./supabase/server";
import type { Listing } from "./types";

export const PUBLIC_FORUM_BOARDS = [
  {
    slug: "valley",
    title: "Valley yard",
    description:
      "Ohio, Pennsylvania, Kentucky, and West Virginia. Listings, seasons, and anything that does not belong to one quadrant.",
    allianceSlug: null as AllianceSlug | null,
    coopSlug: null as string | null,
    privateLane: false,
    series: null as string | null,
    summitYear: null as number | null,
    laneKind: null as string | null,
  },
  ...(["northwest", "northeast", "southwest", "southeast"] as const).map((slug) => ({
    slug,
    title: ALLIANCES[slug].name,
    description: ALLIANCES[slug].summary,
    allianceSlug: slug as AllianceSlug | null,
    coopSlug: null as string | null,
    privateLane: false,
    series: null as string | null,
    summitYear: null as number | null,
    laneKind: null as string | null,
  })),
] as const;

/** @deprecated Prefer PUBLIC_FORUM_BOARDS; kept for existing imports. */
export const FORUM_BOARDS = PUBLIC_FORUM_BOARDS;

export type ForumBoardSlug = (typeof PUBLIC_FORUM_BOARDS)[number]["slug"] | string;

export type PublicProfile = {
  id: string;
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
  createdAt: string;
};

export type ForumBoard = {
  slug: string;
  title: string;
  description: string;
  allianceSlug: AllianceSlug | null;
  coopSlug: string | null;
  privateLane: boolean;
  series: string | null;
  summitYear: number | null;
  laneKind: string | null;
  topicCount: number;
};

export type ForumTopic = {
  id: string;
  boardSlug: string;
  authorId: string;
  authorName: string;
  title: string;
  createdAt: string;
  replyCount: number;
};

export type ForumPost = {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type GrazeStatus = "pending" | "confirmed" | "declined";

export type GrazeRecord = {
  id: string;
  listingId: string;
  listingTitle: string | null;
  hostId: string;
  grazierId: string;
  proposedBy: string;
  status: GrazeStatus;
  createdAt: string;
  resolvedAt: string | null;
};

export type MemberStats = {
  profile: PublicProfile;
  grazedCount: number;
  hostedCount: number;
  reputation: number;
  badges: MemberBadge[];
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  role: string | null;
  home_state: string | null;
  home_county: string | null;
  alliance_slug: string | null;
  organic_certified?: boolean | null;
  organic_certifier?: string | null;
  offers_land?: boolean | null;
  offers_livestock?: boolean | null;
  member_oeffa?: boolean | null;
  member_sare?: boolean | null;
  oeffa_certified?: boolean | null;
  other_certified?: boolean | null;
  other_certification_notes?: string | null;
  affiliation_orgs?: string[] | null;
  accreditations?: string[] | null;
  avatar_url?: string | null;
  logo_url?: string | null;
  pasture_photos?: string[] | null;
  livestock_photos?: string[] | null;
  created_at: string;
};

type BoardRow = {
  slug: string;
  title: string;
  description: string;
  alliance_slug: string | null;
  coop_slug: string | null;
  series?: string | null;
  summit_year?: number | null;
  lane_kind?: string | null;
};

type TopicRow = {
  id: string;
  board_slug: string;
  author_id: string;
  title: string;
  created_at: string;
};

type PostRow = {
  id: string;
  topic_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

type GrazeRow = {
  id: string;
  listing_id: string;
  host_id: string;
  grazier_id: string;
  proposed_by: string;
  status: GrazeStatus;
  created_at: string;
  resolved_at: string | null;
};

export function isForumBoardSlug(value: string | null | undefined): value is string {
  return !!value && /^[a-z0-9-]{2,64}$/.test(value);
}

export function forumBoardBySlug(slug: string | null | undefined) {
  return PUBLIC_FORUM_BOARDS.find((board) => board.slug === slug) ?? null;
}

const PROFILE_SELECT =
  "id, display_name, role, home_state, home_county, alliance_slug, organic_certified, organic_certifier, offers_land, offers_livestock, member_oeffa, member_sare, oeffa_certified, other_certified, other_certification_notes, affiliation_orgs, accreditations, avatar_url, logo_url, pasture_photos, livestock_photos, created_at";

async function coopsForProfiles(ids: string[]) {
  const map = new Map<string, CoopMembership[]>();
  if (!ids.length || !isSupabaseConfigured()) return map;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_coops")
    .select("profile_id, coop_slug, membership_role")
    .in("profile_id", ids);
  for (const row of data ?? []) {
    if (!isCoopSlug(row.coop_slug)) continue;
    const meta = coopBySlug(row.coop_slug);
    if (!meta) continue;
    const list = map.get(row.profile_id) ?? [];
    list.push({
      slug: meta.slug,
      name: meta.name,
      role: (row.membership_role as CoopMembershipRole) === "org" ? "org" : "member",
      boardSlug: meta.boardSlug,
    });
    map.set(row.profile_id, list);
  }
  return map;
}

function fromProfile(row: ProfileRow, coops: CoopMembership[] = []): PublicProfile {
  return {
    id: row.id,
    displayName: row.display_name || "Member",
    isAdmin: row.role === "admin",
    homeState: isServiceState(row.home_state) ? row.home_state : null,
    homeCounty: row.home_county,
    allianceSlug: isAllianceSlug(row.alliance_slug) ? row.alliance_slug : null,
    organicCertified: Boolean(row.organic_certified),
    organicCertifier: isCertifierSlug(row.organic_certifier) ? row.organic_certifier : null,
    offersLand: Boolean(row.offers_land),
    offersLivestock: Boolean(row.offers_livestock),
    memberOeffa: Boolean(row.member_oeffa),
    memberSare: Boolean(row.member_sare),
    oeffaCertified: Boolean(row.oeffa_certified),
    otherCertified: Boolean(row.other_certified),
    otherCertificationNotes: row.other_certification_notes ?? null,
    affiliationOrgs: parseAffiliationOrgs(
      Array.isArray(row.affiliation_orgs) ? row.affiliation_orgs.filter(Boolean) : [],
    ),
    accreditations: Array.isArray(row.accreditations) ? row.accreditations.filter(Boolean) : [],
    avatarUrl: row.avatar_url ?? null,
    logoUrl: row.logo_url ?? null,
    pasturePhotos: Array.isArray(row.pasture_photos) ? row.pasture_photos.filter(Boolean) : [],
    livestockPhotos: Array.isArray(row.livestock_photos)
      ? row.livestock_photos.filter(Boolean)
      : [],
    coops,
    createdAt: row.created_at,
  };
}

async function namesById(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, string>();
  if (!unique.length || !isSupabaseConfigured()) return map;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, display_name").in("id", unique);
  for (const row of data ?? []) {
    map.set(row.id, row.display_name || "Member");
  }
  return map;
}

export async function getPublicProfile(id: string): Promise<PublicProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const coops = await coopsForProfiles([id]);
  return fromProfile(data as ProfileRow, coops.get(id) ?? []);
}

export async function listAllianceMembers(slug: AllianceSlug) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("alliance_slug", slug)
    .order("display_name", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data as ProfileRow[] | null) ?? [];
  const coops = await coopsForProfiles(rows.map((row) => row.id));
  return rows.map((row) => fromProfile(row, coops.get(row.id) ?? []));
}

export async function listAllianceListings(slug: AllianceSlug) {
  const listings = await listListings();
  return listings.filter((listing) => allianceForListing(listing) === slug);
}

export async function listForumBoards(): Promise<ForumBoard[]> {
  if (!isSupabaseConfigured()) {
    return PUBLIC_FORUM_BOARDS.map((board) => ({ ...board, topicCount: 0 }));
  }

  const supabase = await createClient();
  const [{ data: boards, error: boardError }, { data: topics, error: topicError }] =
    await Promise.all([
      supabase
        .from("forum_boards")
        .select("slug, title, description, alliance_slug, coop_slug, series, summit_year, lane_kind")
        .order("title", { ascending: true }),
      supabase.from("forum_topics").select("board_slug"),
    ]);
  if (boardError) throw new Error(boardError.message);
  if (topicError) throw new Error(topicError.message);

  const counts = new Map<string, number>();
  for (const row of topics ?? []) {
    counts.set(row.board_slug, (counts.get(row.board_slug) ?? 0) + 1);
  }

  const rows = (boards as BoardRow[] | null) ?? [];
  const publicOrder = new Map<string, number>(
    PUBLIC_FORUM_BOARDS.map((board, index) => [board.slug, index]),
  );
  const mapped = rows.map((board) => ({
    slug: board.slug,
    title: board.title,
    description: board.description,
    allianceSlug: isAllianceSlug(board.alliance_slug) ? board.alliance_slug : null,
    coopSlug: board.coop_slug,
    privateLane: Boolean(board.coop_slug),
    series: board.series ?? null,
    summitYear: board.summit_year ?? null,
    laneKind: board.lane_kind ?? null,
    topicCount: counts.get(board.slug) ?? 0,
  }));

  return mapped.sort((a, b) => {
    if (a.series === "stinner" || b.series === "stinner") {
      if (a.series === "stinner" && b.series !== "stinner") return 1;
      if (b.series === "stinner" && a.series !== "stinner") return -1;
      const yearDiff = (b.summitYear ?? 0) - (a.summitYear ?? 0);
      if (yearDiff !== 0) return yearDiff;
      if (a.laneKind === "year" && b.laneKind !== "year") return -1;
      if (b.laneKind === "year" && a.laneKind !== "year") return 1;
    }
    const ai = publicOrder.get(a.slug) ?? 1000;
    const bi = publicOrder.get(b.slug) ?? 1000;
    if (ai !== bi) return ai - bi;
    return a.title.localeCompare(b.title);
  });
}

export async function resolveForumBoard(slug: string): Promise<ForumBoard | null> {
  const publicBoard = forumBoardBySlug(slug);
  if (publicBoard) {
    return {
      ...publicBoard,
      series: publicBoard.series ?? null,
      summitYear: publicBoard.summitYear ?? null,
      laneKind: publicBoard.laneKind ?? null,
      topicCount: 0,
    };
  }

  const { stinnerBoardMeta } = await import("./stinner");
  const stinner = stinnerBoardMeta(slug);
  if (stinner && !isSupabaseConfigured()) {
    return {
      slug,
      title: stinner.title,
      description: stinner.description,
      allianceSlug: null,
      coopSlug: null,
      privateLane: false,
      series: "stinner",
      summitYear: stinner.year,
      laneKind: stinner.chosen ? "chosen-projects" : "year",
      topicCount: 0,
    };
  }
  if (!isSupabaseConfigured() || !isForumBoardSlug(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_boards")
    .select("slug, title, description, alliance_slug, coop_slug, series, summit_year, lane_kind")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const board = data as BoardRow;
  return {
    slug: board.slug,
    title: board.title,
    description: board.description,
    allianceSlug: isAllianceSlug(board.alliance_slug) ? board.alliance_slug : null,
    coopSlug: board.coop_slug,
    privateLane: Boolean(board.coop_slug),
    series: board.series ?? null,
    summitYear: board.summit_year ?? null,
    laneKind: board.lane_kind ?? null,
    topicCount: 0,
  };
}

export async function listForumTopics(boardSlug: string): Promise<ForumTopic[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_topics")
    .select("id, board_slug, author_id, title, created_at")
    .eq("board_slug", boardSlug)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const topics = (data as TopicRow[] | null) ?? [];
  const names = await namesById(topics.map((topic) => topic.author_id));
  const ids = topics.map((topic) => topic.id);
  const replyCounts = new Map<string, number>();
  if (ids.length) {
    const { data: posts, error: postError } = await supabase
      .from("forum_posts")
      .select("topic_id")
      .in("topic_id", ids);
    if (postError) throw new Error(postError.message);
    for (const post of posts ?? []) {
      replyCounts.set(post.topic_id, (replyCounts.get(post.topic_id) ?? 0) + 1);
    }
  }
  return topics.map((topic) => ({
    id: topic.id,
    boardSlug: topic.board_slug,
    authorId: topic.author_id,
    authorName: names.get(topic.author_id) || "Member",
    title: topic.title,
    createdAt: topic.created_at,
    replyCount: Math.max(0, (replyCounts.get(topic.id) ?? 1) - 1),
  }));
}

export async function getForumTopic(id: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_topics")
    .select("id, board_slug, author_id, title, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const topic = data as TopicRow;
  const { data: posts, error: postError } = await supabase
    .from("forum_posts")
    .select("id, topic_id, author_id, body, created_at")
    .eq("topic_id", id)
    .order("created_at", { ascending: true });
  if (postError) throw new Error(postError.message);
  const postRows = (posts as PostRow[] | null) ?? [];
  const names = await namesById([topic.author_id, ...postRows.map((post) => post.author_id)]);
  return {
    topic: {
      id: topic.id,
      boardSlug: topic.board_slug,
      authorId: topic.author_id,
      authorName: names.get(topic.author_id) || "Member",
      title: topic.title,
      createdAt: topic.created_at,
      replyCount: Math.max(0, postRows.length - 1),
    } satisfies ForumTopic,
    posts: postRows.map(
      (post): ForumPost => ({
        id: post.id,
        topicId: post.topic_id,
        authorId: post.author_id,
        authorName: names.get(post.author_id) || "Member",
        body: post.body,
        createdAt: post.created_at,
      }),
    ),
  };
}

export async function createForumTopic(input: {
  boardSlug: ForumBoardSlug;
  authorId: string;
  title: string;
  body: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_topics")
    .insert({
      board_slug: input.boardSlug,
      author_id: input.authorId,
      title: input.title,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const topicId = data.id as string;
  const { error: postError } = await supabase.from("forum_posts").insert({
    topic_id: topicId,
    author_id: input.authorId,
    body: input.body,
  });
  if (postError) {
    await supabase.from("forum_topics").delete().eq("id", topicId);
    throw new Error(postError.message);
  }
  return topicId;
}

export async function createForumPost(input: {
  topicId: string;
  authorId: string;
  body: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("forum_posts").insert({
    topic_id: input.topicId,
    author_id: input.authorId,
    body: input.body,
  });
  if (error) throw new Error(error.message);
}

export async function updateProfile(input: {
  userId: string;
  displayName: string;
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
  coopSlugs: string[];
  avatarUrl: string | null;
  logoUrl: string | null;
  pasturePhotos: string[];
  livestockPhotos: string[];
  farmtec: Omit<FarmtecSnapshot, "updatedAt">;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      home_state: input.homeState,
      home_county: input.homeCounty,
      alliance_slug: input.allianceSlug,
      organic_certified: input.organicCertified,
      organic_certifier: input.organicCertified ? input.organicCertifier : null,
      offers_land: input.offersLand,
      offers_livestock: input.offersLivestock,
      member_oeffa: input.memberOeffa,
      member_sare: input.memberSare,
      oeffa_certified: input.oeffaCertified || input.organicCertifier === "oeffa",
      other_certified: input.otherCertified,
      other_certification_notes: input.otherCertificationNotes,
      affiliation_orgs: input.affiliationOrgs,
      accreditations: input.accreditations,
      avatar_url: input.avatarUrl,
      logo_url: input.logoUrl,
      pasture_photos: input.pasturePhotos.slice(0, 8),
      livestock_photos: input.livestockPhotos.slice(0, 8),
    })
    .eq("id", input.userId);
  if (error) throw new Error(error.message);

  const { error: farmtecError } = await supabase.from("farmtec_snapshots").upsert(
    {
      profile_id: input.userId,
      ...farmtecToRow(input.farmtec),
    },
    { onConflict: "profile_id" },
  );
  if (farmtecError) throw new Error(farmtecError.message);

  const wanted = new Set(input.coopSlugs.filter(isCoopSlug));
  const { data: existing, error: existingError } = await supabase
    .from("profile_coops")
    .select("coop_slug, membership_role")
    .eq("profile_id", input.userId);
  if (existingError) throw new Error(existingError.message);

  for (const row of existing ?? []) {
    const slug = row.coop_slug as string;
    if (row.membership_role === "org") continue;
    if (isCoopSlug(slug) && wanted.has(slug)) continue;
    const { error: deleteError } = await supabase
      .from("profile_coops")
      .delete()
      .eq("profile_id", input.userId)
      .eq("coop_slug", slug);
    if (deleteError) throw new Error(deleteError.message);
  }

  const kept = new Set(
    (existing ?? [])
      .filter((row) => row.membership_role === "org" || wanted.has(row.coop_slug as CoopSlug))
      .map((row) => row.coop_slug as string),
  );

  for (const slug of wanted) {
    if (kept.has(slug)) continue;
    const { error: insertError } = await supabase.from("profile_coops").insert({
      profile_id: input.userId,
      coop_slug: slug,
      membership_role: "member",
    });
    if (insertError) throw new Error(insertError.message);
  }
}

/** Host-only anonymized rollup of FarmTec snapshots with research consent. */
export async function getFarmtecResearchRollup(): Promise<FarmtecRollup> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("farmtec_snapshots")
    .select("*")
    .eq("research_consent", true);
  if (error) throw new Error(error.message);
  return rollupFarmtec((data ?? []).map((row) => farmtecFromRow(row)));
}

/** @deprecated Use updateProfile */
export async function updateHomePlace(input: {
  userId: string;
  displayName: string;
  homeState: ServiceState | null;
  homeCounty: string | null;
  allianceSlug: AllianceSlug | null;
  organicCertified: boolean;
}) {
  return updateProfile({
    ...input,
    organicCertifier: null,
    offersLand: false,
    offersLivestock: false,
    memberOeffa: false,
    memberSare: false,
    oeffaCertified: false,
    otherCertified: false,
    otherCertificationNotes: null,
    affiliationOrgs: [],
    accreditations: [],
    coopSlugs: [],
    avatarUrl: null,
    logoUrl: null,
    pasturePhotos: [],
    livestockPhotos: [],
    farmtec: {
      researchConsent: false,
      totalAcres: null,
      pctRowCrop: null,
      pctCoverCrop: null,
      pctGrassPasture: null,
      pctOtherLand: null,
      pctFieldsLivestockGrazed: null,
      livestockIntegrationGoal: null,
      pctOpsFossilFuel: null,
      pctOpsElectric: null,
      pctOpsPtoTractor: null,
      ffPressures: [],
      ffPractices: [],
      notes: null,
    },
  });
}

function fromGraze(row: GrazeRow, listingTitle: string | null = null): GrazeRecord {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle,
    hostId: row.host_id,
    grazierId: row.grazier_id,
    proposedBy: row.proposed_by,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  };
}

export async function listGrazeRecordsForUser(userId: string) {
  if (!isSupabaseConfigured()) {
    return { pending: [] as GrazeRecord[], confirmed: [] as GrazeRecord[] };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grazing_completions")
    .select("id, listing_id, host_id, grazier_id, proposed_by, status, created_at, resolved_at")
    .or(`host_id.eq.${userId},grazier_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data as GrazeRow[] | null) ?? [];
  const listingIds = [...new Set(rows.map((row) => row.listing_id))];
  const titles = new Map<string, string>();
  if (listingIds.length) {
    const { data: listings } = await supabase.from("listings").select("id, title").in("id", listingIds);
    for (const listing of listings ?? []) {
      titles.set(listing.id, listing.title);
    }
  }
  const records = rows.map((row) => fromGraze(row, titles.get(row.listing_id) ?? null));
  return {
    pending: records.filter((record) => record.status === "pending"),
    confirmed: records.filter((record) => record.status === "confirmed"),
  };
}

export async function getListingGraze(listingId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grazing_completions")
    .select("id, listing_id, host_id, grazier_id, proposed_by, status, created_at, resolved_at")
    .eq("listing_id", listingId)
    .in("status", ["pending", "confirmed"]);
  if (error) throw new Error(error.message);
  return ((data as GrazeRow[] | null) ?? []).map((row) => fromGraze(row));
}

export async function proposeGraze(input: {
  listing: Listing;
  userId: string;
  counterpartAttested: boolean;
}) {
  if (!input.listing.ownerId) {
    throw new Error("This listing has no owner to confirm a graze.");
  }
  if (input.listing.ownerId === input.userId) {
    throw new Error("The other party logs the graze. You confirm it.");
  }

  const organicBlock = organicGrazeBlockReason({
    listing: input.listing,
    counterpartAttested: input.counterpartAttested,
  });
  if (organicBlock) {
    throw new Error(organicBlock);
  }

  const parties =
    input.listing.side === "land"
      ? { hostId: input.listing.ownerId, grazierId: input.userId }
      : { hostId: input.userId, grazierId: input.listing.ownerId };

  const organicAttested = input.listing.organicCertified
    ? input.counterpartAttested
    : false;

  const supabase = await createClient();
  const { error } = await supabase.from("grazing_completions").insert({
    listing_id: input.listing.id,
    host_id: parties.hostId,
    grazier_id: parties.grazierId,
    proposed_by: input.userId,
    status: "pending",
    organic_attested: organicAttested,
  });
  if (error) {
    if (error.code === "23505") {
      throw new Error("This graze is already logged for the two of you.");
    }
    throw new Error(error.message);
  }
}

export async function resolveGraze(input: {
  grazeId: string;
  userId: string;
  isAdmin: boolean;
  status: "confirmed" | "declined";
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grazing_completions")
    .select(
      "id, proposed_by, host_id, grazier_id, status, listing_id, organic_attested",
    )
    .eq("id", input.grazeId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("That graze could not be found.");
  if (data.status !== "pending") throw new Error("That graze is already resolved.");
  const party = data.host_id === input.userId || data.grazier_id === input.userId;
  if (!input.isAdmin && (!party || data.proposed_by === input.userId)) {
    throw new Error("The other party confirms or declines this graze.");
  }

  if (input.status === "confirmed") {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("organic_certified, is_demo")
      .eq("id", data.listing_id)
      .maybeSingle();
    if (listingError) throw new Error(listingError.message);
    if (listing?.organic_certified && !data.organic_attested) {
      throw new Error(
        "This organic listing needs organic counterpart attestation before it can be confirmed.",
      );
    }
  }

  const { error: updateError } = await supabase
    .from("grazing_completions")
    .update({ status: input.status, resolved_at: new Date().toISOString() })
    .eq("id", input.grazeId);
  if (updateError) throw new Error(updateError.message);
}

export async function countConfirmedGrazesByUsers(ids: string[]) {
  const unique = [...new Set(ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];
  const map = new Map<string, { grazedCount: number; hostedCount: number }>();
  for (const id of unique) {
    map.set(id, { grazedCount: 0, hostedCount: 0 });
  }
  if (!unique.length || !isSupabaseConfigured()) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grazing_completions")
    .select("host_id, grazier_id")
    .eq("status", "confirmed")
    .or(`host_id.in.(${unique.join(",")}),grazier_id.in.(${unique.join(",")})`);
  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    const hosted = map.get(row.host_id);
    if (hosted) hosted.hostedCount += 1;
    const grazed = map.get(row.grazier_id);
    if (grazed) grazed.grazedCount += 1;
  }
  return map;
}

export async function countConfirmedGrazes(userId: string) {
  const map = await countConfirmedGrazesByUsers([userId]);
  return map.get(userId) ?? { grazedCount: 0, hostedCount: 0 };
}

export async function getMemberStats(profile: PublicProfile): Promise<MemberStats> {
  const counts = await countConfirmedGrazes(profile.id);
  const badgeCounts = {
    ...counts,
    hasAlliance: Boolean(profile.allianceSlug),
    isMember: true,
  };
  return {
    profile,
    grazedCount: counts.grazedCount,
    hostedCount: counts.hostedCount,
    reputation: reputationScore(counts),
    badges: earnedBadges(badgeCounts),
  };
}

export async function memberStatsForProfiles(profiles: PublicProfile[]) {
  const counts = await countConfirmedGrazesByUsers(profiles.map((profile) => profile.id));
  return profiles.map((profile) => {
    const pair = counts.get(profile.id) ?? { grazedCount: 0, hostedCount: 0 };
    return {
      profile,
      grazedCount: pair.grazedCount,
      hostedCount: pair.hostedCount,
      reputation: reputationScore(pair),
      badges: earnedBadges({
        ...pair,
        hasAlliance: Boolean(profile.allianceSlug),
        isMember: true,
      }),
    } satisfies MemberStats;
  });
}
