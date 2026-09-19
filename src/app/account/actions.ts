"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { allianceForPlace, isAllianceSlug } from "@/lib/alliances";
import { getAccount } from "@/lib/auth";
import { isCertifierSlug } from "@/lib/certifiers";
import { isCoopSlug } from "@/lib/coops";
import { updateProfile } from "@/lib/community";
import {
  isFfPractice,
  isFfPressure,
  isLivestockIntegrationGoal,
  parseAcres,
  parsePct,
} from "@/lib/farmtec";
import { parseAffiliationOrgForm, parseAccreditationLines } from "@/lib/profile-affiliations";
import { isCountyInState } from "@/lib/region-counties";
import { isServiceState } from "@/lib/region";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = {
  message: string | null;
};

export type PasswordFormState = {
  message: string | null;
  ok: boolean;
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "yes";
}

const schema = z.object({
  displayName: z.string().trim().min(2, "Use at least 2 characters.").max(80),
  homeState: z.string().refine((value) => !value || isServiceState(value), "Choose a state."),
  homeCounty: z.string().max(80),
  organicCertified: z.boolean(),
  organicCertifier: z.string(),
  offersLand: z.boolean(),
  offersLivestock: z.boolean(),
  memberOeffa: z.boolean(),
  memberSare: z.boolean(),
  oeffaCertified: z.boolean(),
  otherCertified: z.boolean(),
  otherCertificationNotes: z.string().max(200),
  affiliationOrgs: z.array(z.string()),
  accreditations: z.string().max(1200),
  coopSlugs: z.array(z.string()),
  avatarUrl: z.string().url().nullable().or(z.literal("")),
  logoUrl: z.string().url().nullable().or(z.literal("")),
  pasturePhotos: z.array(z.string().url()).max(8),
  livestockPhotos: z.array(z.string().url()).max(8),
});

function urlList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string" && /^https?:\/\//.test(value));
}

function optionalUrl(value: string) {
  return value && /^https?:\/\//.test(value) ? value : null;
}

function optionalPct(formData: FormData, key: string): number | null | "invalid" {
  const raw = text(formData, key);
  if (!raw) return null;
  const n = parsePct(raw);
  return n == null ? "invalid" : n;
}

function parseFarmtecFromForm(formData: FormData) {
  const totalRaw = text(formData, "farmtecTotalAcres");
  let totalAcres: number | null = null;
  if (totalRaw) {
    totalAcres = parseAcres(totalRaw);
    if (totalAcres == null) return { error: "Total acres must be between 0 and 100,000." as const };
  }

  const pcts = {
    pctRowCrop: optionalPct(formData, "farmtecPctRowCrop"),
    pctCoverCrop: optionalPct(formData, "farmtecPctCoverCrop"),
    pctGrassPasture: optionalPct(formData, "farmtecPctGrassPasture"),
    pctOtherLand: optionalPct(formData, "farmtecPctOtherLand"),
    pctFieldsLivestockGrazed: optionalPct(formData, "farmtecPctFieldsLivestockGrazed"),
    pctOpsFossilFuel: optionalPct(formData, "farmtecPctOpsFossilFuel"),
    pctOpsElectric: optionalPct(formData, "farmtecPctOpsElectric"),
    pctOpsPtoTractor: optionalPct(formData, "farmtecPctOpsPtoTractor"),
  };
  for (const value of Object.values(pcts)) {
    if (value === "invalid") {
      return { error: "Percentages must be whole numbers from 0 to 100." as const };
    }
  }

  const goalRaw = text(formData, "farmtecLivestockIntegrationGoal");
  const livestockIntegrationGoal =
    !goalRaw || goalRaw === "unset"
      ? null
      : isLivestockIntegrationGoal(goalRaw)
        ? goalRaw
        : ("bad" as const);
  if (livestockIntegrationGoal === "bad") {
    return { error: "Choose a valid livestock integration goal." as const };
  }

  const notesRaw = text(formData, "farmtecNotes");
  if (notesRaw && (notesRaw.length < 2 || notesRaw.length > 800)) {
    return { error: "FarmTec notes must be 2–800 characters, or leave blank." as const };
  }

  return {
    farmtec: {
      researchConsent: checked(formData, "farmtecResearchConsent"),
      totalAcres,
      pctRowCrop: pcts.pctRowCrop as number | null,
      pctCoverCrop: pcts.pctCoverCrop as number | null,
      pctGrassPasture: pcts.pctGrassPasture as number | null,
      pctOtherLand: pcts.pctOtherLand as number | null,
      pctFieldsLivestockGrazed: pcts.pctFieldsLivestockGrazed as number | null,
      livestockIntegrationGoal,
      pctOpsFossilFuel: pcts.pctOpsFossilFuel as number | null,
      pctOpsElectric: pcts.pctOpsElectric as number | null,
      pctOpsPtoTractor: pcts.pctOpsPtoTractor as number | null,
      ffPressures: formData
        .getAll("farmtecFfPressures")
        .filter((value): value is string => typeof value === "string")
        .filter(isFfPressure),
      ffPractices: formData
        .getAll("farmtecFfPractices")
        .filter((value): value is string => typeof value === "string")
        .filter(isFfPractice),
      notes: notesRaw || null,
    },
  };
}

export async function updateProfileAction(
  _previous: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Accounts need a connected Supabase project." };
  }
  const account = await getAccount();
  if (!account) {
    redirect("/sign-in?next=/account");
  }

  const coopSlugs = formData
    .getAll("coops")
    .filter((value): value is string => typeof value === "string" && isCoopSlug(value));
  const affiliationOrgs = formData
    .getAll("affiliationOrgs")
    .filter((value): value is string => typeof value === "string");

  const parsed = schema.safeParse({
    displayName: text(formData, "displayName"),
    homeState: text(formData, "homeState"),
    homeCounty: text(formData, "homeCounty"),
    organicCertified: text(formData, "organicCertified") === "yes",
    organicCertifier: text(formData, "organicCertifier"),
    offersLand: checked(formData, "offersLand"),
    offersLivestock: checked(formData, "offersLivestock"),
    memberOeffa: checked(formData, "memberOeffa"),
    memberSare: checked(formData, "memberSare"),
    oeffaCertified: checked(formData, "oeffaCertified"),
    otherCertified: checked(formData, "otherCertified"),
    otherCertificationNotes: text(formData, "otherCertificationNotes"),
    affiliationOrgs,
    accreditations: text(formData, "accreditations"),
    coopSlugs,
    avatarUrl: text(formData, "avatarUrl"),
    logoUrl: text(formData, "logoUrl"),
    pasturePhotos: urlList(formData, "pasturePhotos"),
    livestockPhotos: urlList(formData, "livestockPhotos"),
  });
  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Fix the form and try again." };
  }

  const homeState = parsed.data.homeState ? parsed.data.homeState : null;
  const homeCounty = parsed.data.homeCounty || null;
  if ((homeState && !homeCounty) || (!homeState && homeCounty)) {
    return { message: "Choose both a home state and a county, or leave both blank." };
  }
  if (homeState && homeCounty && !isCountyInState(homeState, homeCounty)) {
    return { message: "That county is not in the selected state." };
  }

  const allianceSlug = allianceForPlace(homeState, homeCounty);
  if (homeState && homeCounty && !isAllianceSlug(allianceSlug)) {
    return { message: "That place could not be assigned to an alliance." };
  }

  const otherNotes = parsed.data.otherCertified
    ? parsed.data.otherCertificationNotes || null
    : null;
  if (parsed.data.otherCertified && (!otherNotes || otherNotes.length < 2)) {
    return { message: "Name the other certification, or uncheck Other certified." };
  }

  if (
    parsed.data.organicCertified &&
    !isCertifierSlug(parsed.data.organicCertifier)
  ) {
    return { message: "Choose your USDA-accredited organic certifier." };
  }

  const organicCertifier =
    parsed.data.organicCertified && isCertifierSlug(parsed.data.organicCertifier)
      ? parsed.data.organicCertifier
      : null;

  const farmtecParsed = parseFarmtecFromForm(formData);
  if ("error" in farmtecParsed) {
    return { message: farmtecParsed.error ?? "Fix the FarmTec fields and try again." };
  }

  try {
    await updateProfile({
      userId: account.id,
      displayName: parsed.data.displayName,
      homeState: isServiceState(homeState) ? homeState : null,
      homeCounty,
      allianceSlug,
      organicCertified: parsed.data.organicCertified,
      organicCertifier,
      offersLand: parsed.data.offersLand,
      offersLivestock: parsed.data.offersLivestock,
      memberOeffa: parsed.data.memberOeffa,
      memberSare: parsed.data.memberSare,
      oeffaCertified: parsed.data.oeffaCertified || organicCertifier === "oeffa",
      otherCertified: parsed.data.otherCertified,
      otherCertificationNotes: otherNotes,
      affiliationOrgs: parseAffiliationOrgForm(parsed.data.affiliationOrgs),
      accreditations: parseAccreditationLines(parsed.data.accreditations),
      coopSlugs: parsed.data.coopSlugs,
      avatarUrl: optionalUrl(parsed.data.avatarUrl || ""),
      logoUrl: optionalUrl(parsed.data.logoUrl || ""),
      pasturePhotos: parsed.data.pasturePhotos,
      livestockPhotos: parsed.data.livestockPhotos,
      farmtec: farmtecParsed.farmtec,
    });
  } catch (error) {
    unstable_rethrow(error);
    return {
      message: error instanceof Error ? error.message : "The profile could not be saved.",
    };
  }
  redirect("/account");
}

export async function changePasswordAction(
  _previous: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  if (!isSupabaseConfigured()) {
    return { message: "Accounts need a connected Supabase project.", ok: false };
  }

  const account = await getAccount();
  if (!account) {
    redirect("/sign-in?next=/account");
  }
  if (!account.email) {
    return { message: "This account has no email to verify against.", ok: false };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");
  const current =
    typeof currentPassword === "string" ? currentPassword : "";
  const next =
    typeof newPassword === "string" ? newPassword : "";
  const confirm =
    typeof confirmPassword === "string" ? confirmPassword : "";

  if (current.length < 1) {
    return { message: "Enter your current password.", ok: false };
  }
  if (next.length < 8) {
    return { message: "Use a new password of at least 8 characters.", ok: false };
  }
  if (next !== confirm) {
    return { message: "New password and confirmation do not match.", ok: false };
  }
  if (next === current) {
    return { message: "Pick a new password that is different from the current one.", ok: false };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: account.email,
    password: current,
  });
  if (verifyError) {
    return { message: "Current password is incorrect.", ok: false };
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    return { message: error.message, ok: false };
  }

  return { message: "Password updated.", ok: true };
}
