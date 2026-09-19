"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { getAccount } from "@/lib/auth";
import { isOhioCounty } from "@/lib/counties";
import { createListing, deleteListing } from "@/lib/listings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  FENCING_OPTIONS,
  LAND_TYPES,
  LISTING_SIDES,
  LIVESTOCK_TYPES,
  SEASONS,
} from "@/lib/types";

export type ListingFormState = {
  message: string | null;
  fieldErrors: Record<string, string>;
};

const schema = z
  .object({
    side: z.enum(LISTING_SIDES),
    title: z.string().trim().min(8, "Use at least 8 characters.").max(140),
    county: z.string().refine(isOhioCounty, "Choose an Ohio county."),
    nearestTown: z.string().trim().min(2, "Name the nearest town.").max(80),
    landType: z.enum(LAND_TYPES).optional(),
    livestockType: z.enum(LIVESTOCK_TYPES),
    seasons: z.array(z.enum(SEASONS)).min(1, "Pick at least one season."),
    availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a start date."),
    availableUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an end date."),
    acres: z.number().positive("Acres must be greater than zero.").nullable(),
    headCount: z.number().int().positive("Head count must be at least 1.").nullable(),
    travelRadiusMiles: z
      .number()
      .int()
      .min(0, "Travel radius cannot be negative.")
      .max(300)
      .nullable(),
    fencing: z.enum(FENCING_OPTIONS).nullable(),
    waterAvailable: z.boolean().nullable(),
    rateNotes: z.string().trim().max(240).nullable(),
    description: z
      .string()
      .trim()
      .min(20, "Add a bit more detail, at least 20 characters.")
      .max(4000),
    contactName: z.string().trim().min(2, "Add a contact name.").max(80),
    contactEmail: z.string().trim().email("Enter a real email address."),
    contactPhone: z.string().trim().max(30).nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.availableUntil < value.availableFrom) {
      ctx.addIssue({
        code: "custom",
        path: ["availableUntil"],
        message: "The end date has to be on or after the start date.",
      });
    }
    if (value.side === "land") {
      if (!value.landType) {
        ctx.addIssue({
          code: "custom",
          path: ["landType"],
          message: "Choose the kind of forage.",
        });
      }
      if (value.acres == null) {
        ctx.addIssue({
          code: "custom",
          path: ["acres"],
          message: "Acres are required for a land listing.",
        });
      }
    }
    if (value.side === "livestock") {
      if (value.headCount == null) {
        ctx.addIssue({
          code: "custom",
          path: ["headCount"],
          message: "Head count is required for a livestock listing.",
        });
      }
      if (value.travelRadiusMiles == null) {
        ctx.addIssue({
          code: "custom",
          path: ["travelRadiusMiles"],
          message: "Say how far you will travel.",
        });
      }
    }
  });

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalNumber(formData: FormData, key: string) {
  const value = text(formData, key).trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function fieldErrorsFrom(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export async function createListingAction(
  _previous: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const landType = text(formData, "landType");
  const fencing = text(formData, "fencing");
  const water = text(formData, "waterAvailable");
  const phone = text(formData, "contactPhone").trim();
  const rate = text(formData, "rateNotes").trim();

  const parsed = schema.safeParse({
    side: text(formData, "side"),
    title: text(formData, "title"),
    county: text(formData, "county"),
    nearestTown: text(formData, "nearestTown"),
    landType: landType || undefined,
    livestockType: text(formData, "livestockType"),
    seasons: formData.getAll("seasons").filter((value): value is string => typeof value === "string"),
    availableFrom: text(formData, "availableFrom"),
    availableUntil: text(formData, "availableUntil"),
    acres: optionalNumber(formData, "acres"),
    headCount: optionalNumber(formData, "headCount"),
    travelRadiusMiles: optionalNumber(formData, "travelRadiusMiles"),
    fencing: fencing || null,
    waterAvailable: water === "yes" ? true : water === "no" ? false : null,
    rateNotes: rate || null,
    description: text(formData, "description"),
    contactName: text(formData, "contactName"),
    contactEmail: text(formData, "contactEmail"),
    contactPhone: phone || null,
  });

  if (!parsed.success) {
    return {
      message: "Fix the highlighted fields and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const account = await getAccount();
  if (isSupabaseConfigured() && !account) {
    redirect("/sign-in?next=/listings/new");
  }

  const value = parsed.data;
  try {
    const listing = await createListing(
      {
        side: value.side,
        title: value.title,
        state: "Ohio",
        county: value.county,
        nearestTown: value.nearestTown,
        landType: value.side === "land" ? value.landType ?? null : value.landType ?? null,
        livestockType: value.livestockType,
        seasons: value.seasons,
        availableFrom: value.availableFrom,
        availableUntil: value.availableUntil,
        acres: value.side === "land" ? value.acres : null,
        headCount: value.side === "livestock" ? value.headCount : null,
        travelRadiusMiles: value.side === "livestock" ? value.travelRadiusMiles : null,
        fencing: value.side === "land" ? value.fencing : null,
        waterAvailable: value.side === "land" ? value.waterAvailable : null,
        rateNotes: value.rateNotes,
        description: value.description,
        contactName: value.contactName,
        contactEmail: value.contactEmail,
        contactPhone: value.contactPhone,
      },
      account?.id ?? null,
    );
    redirect(`/listings/${listing.id}`);
  } catch (error) {
    unstable_rethrow(error);
    return {
      message:
        error instanceof Error
          ? error.message
          : "The listing could not be saved. Try again.",
      fieldErrors: {},
    };
  }
}

export async function deleteListingAction(formData: FormData) {
  const account = await getAccount();
  if (isSupabaseConfigured() && !account) {
    redirect("/sign-in");
  }
  const id = text(formData, "id");
  const next = text(formData, "next") || "/account";
  try {
    await deleteListing(id);
  } catch (error) {
    unstable_rethrow(error);
    throw error instanceof Error ? error : new Error("The listing could not be removed.");
  }
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
}
