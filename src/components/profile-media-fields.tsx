"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  isAllowedImage,
  MEDIA_LIMITS,
  MEMBER_MEDIA_BUCKET,
  mediaPath,
  type MediaKind,
} from "@/lib/member-media";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Props = {
  userId: string;
  avatarUrl: string | null;
  logoUrl: string | null;
  pasturePhotos: string[];
  livestockPhotos: string[];
};

async function uploadOne(userId: string, kind: MediaKind, file: File) {
  if (!isAllowedImage(file)) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF under 5 MB.");
  }
  const supabase = createBrowserSupabase();
  const path = mediaPath(userId, kind, file.name);
  const { error } = await supabase.storage.from(MEMBER_MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(MEMBER_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function SinglePhoto({
  label,
  hint,
  name,
  kind,
  userId,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  name: string;
  kind: MediaKind;
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground">{hint}</p>
      <input type="hidden" name={name} value={value ?? ""} />
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-28 w-28 rounded-md object-cover" />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setBusy(true);
              setError(null);
              try {
                onChange(await uploadOne(userId, kind, file));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setBusy(false);
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <span>{busy ? "Uploading…" : value ? "Replace" : "Upload"}</span>
          </Button>
        </label>
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function Gallery({
  label,
  hint,
  name,
  kind,
  userId,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  name: string;
  kind: MediaKind;
  userId: string;
  values: string[];
  onChange: (urls: string[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = MEDIA_LIMITS[kind];

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground">{hint}</p>
      {values.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-24 w-24 rounded-md object-cover" />
              <button
                type="button"
                className="absolute top-1 right-1 rounded bg-background/90 px-1.5 text-xs"
                onClick={() => onChange(values.filter((item) => item !== url))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {values.length < limit ? (
        <label className="inline-flex w-fit">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setBusy(true);
              setError(null);
              try {
                const url = await uploadOne(userId, kind, file);
                onChange([...values, url].slice(0, limit));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed.");
              } finally {
                setBusy(false);
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <span>{busy ? "Uploading…" : "Add photo"}</span>
          </Button>
        </label>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

export function ProfileMediaFields({
  userId,
  avatarUrl,
  logoUrl,
  pasturePhotos,
  livestockPhotos,
}: Props) {
  const [avatar, setAvatar] = useState(avatarUrl);
  const [logo, setLogo] = useState(logoUrl);
  const [pasture, setPasture] = useState(pasturePhotos);
  const [livestock, setLivestock] = useState(livestockPhotos);

  return (
    <fieldset className="grid gap-5">
      <legend className="text-sm font-medium">Photos</legend>
      <p className="text-sm text-muted-foreground">
        Profile photo, optional farm logo, and pictures of your pastures and livestock.
        Images go to your member folder and show on your public profile.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <SinglePhoto
          label="Profile photo"
          hint="A clear headshot or farm portrait."
          name="avatarUrl"
          kind="avatar"
          userId={userId}
          value={avatar}
          onChange={setAvatar}
        />
        <SinglePhoto
          label="Logo"
          hint="Optional. Farm or business mark."
          name="logoUrl"
          kind="logo"
          userId={userId}
          value={logo}
          onChange={setLogo}
        />
      </div>
      <Gallery
        label="Pasture / forage photos"
        hint="Up to 8. Fields, paddocks, covers, woods."
        name="pasturePhotos"
        kind="pasture"
        userId={userId}
        values={pasture}
        onChange={setPasture}
      />
      <Gallery
        label="Livestock photos"
        hint="Up to 8. Herd or flock shots that help a match."
        name="livestockPhotos"
        kind="livestock"
        userId={userId}
        values={livestock}
        onChange={setLivestock}
      />
    </fieldset>
  );
}
