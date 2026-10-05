export const MEMBER_MEDIA_BUCKET = "member-media";

export const MEDIA_KINDS = ["avatar", "logo", "pasture", "livestock"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_LIMITS: Record<MediaKind, number> = {
  avatar: 1,
  logo: 1,
  pasture: 8,
  livestock: 8,
};

export function mediaPath(userId: string, kind: MediaKind, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  return `${userId}/${kind}/${Date.now()}-${safe}`;
}

export function isAllowedImage(file: File) {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) && file.size <= 5_242_880;
}
