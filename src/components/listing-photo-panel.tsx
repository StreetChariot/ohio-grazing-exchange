import { ImageOff } from "lucide-react";
import type { ListingSide } from "@/lib/types";

export function ListingPhotoPanel({
  side,
  photos,
  logoUrl,
}: {
  side: ListingSide;
  photos: string[];
  logoUrl: string | null;
}) {
  const label =
    side === "land" ? "Pasture / forage photos" : "Livestock photos";

  if (photos.length > 0) {
    const hero = photos[0];
    const rest = photos.slice(1, 4);
    return (
      <figure className="listing-visual flex h-full min-h-[14rem] flex-col overflow-hidden rounded-xl border bg-muted/30">
        <div className="relative min-h-0 flex-1 bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        {rest.length > 0 ? (
          <div className="grid grid-cols-3 gap-px border-t bg-border">
            {rest.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="aspect-[4/3] h-16 w-full object-cover sm:h-20"
              />
            ))}
          </div>
        ) : null}
        <figcaption className="border-t px-3 py-1.5 text-xs text-muted-foreground">
          {label}
        </figcaption>
      </figure>
    );
  }

  if (logoUrl) {
    return (
      <figure className="listing-visual flex h-full min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border bg-muted/30 px-4 py-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className="max-h-28 max-w-[70%] object-contain"
        />
        <figcaption className="text-center text-xs text-muted-foreground">
          Farm logo · no listing photos provided
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="listing-visual flex h-full min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-muted-foreground">
      <span className="relative inline-flex size-16 items-center justify-center rounded-full border border-dashed">
        <ImageOff className="size-8" aria-hidden />
      </span>
      <figcaption className="text-center text-sm font-medium text-foreground">
        No photos provided
      </figcaption>
      <p className="max-w-[16rem] text-center text-xs">
        Print and board posters still show a uniform photo panel so every listing
        looks the same on the wall.
      </p>
    </figure>
  );
}
