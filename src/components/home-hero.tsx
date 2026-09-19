"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { ExchangeMark } from "@/components/exchange-mark";
import { Button } from "@/components/ui/button";
import {
  clearIntroCookie,
  INTRO_COLLAPSED,
  INTRO_DISMISSED,
  writeIntroCookie,
} from "@/lib/intro-preference";
import { PRODUCT_NAME } from "@/lib/region";

const scenes = [
  {
    src: "/hero/pasture-cattle.png",
    alt: "Beef cattle grazing a wide pasture",
    kicker: "How it works",
    title: "Two sides, one match",
    body: "Land lists the forage. Livestock lists the herd, how far it will travel, and the season it needs feed.",
  },
  {
    src: "/hero/cover-crop-sheep.png",
    alt: "Sheep grazing cereal rye and clover",
    kicker: "Hardy cover",
    title: "Rye, clover, and residue count",
    body: "A listing can be pasture, a cover crop, or what is left after harvest. The animal side is looking for that feed.",
  },
  {
    src: "/hero/woodland-goats.png",
    alt: "Goats browsing shrubs at the edge of a woods",
    kicker: "Browse",
    title: "Woods are forage too",
    body: "Goats and other stock can take rough ground and oak woods, not only open sod.",
  },
  {
    src: "/hero/schoolyard-sheep.png",
    alt: "Sheep grazing the lawn of a suburban school",
    kicker: "School yards",
    title: "A suburban lawn can be a window",
    body: "After hours, a school yard is still grass. The same posting works there as on a farm.",
  },
  {
    src: "/hero/urban-school-goats.png",
    alt: "Goats grazing a fenced school lot in a neighborhood",
    kicker: "School yards",
    title: "City lots too",
    body: "A fenced urban green can be a short graze when the herd and the neighbors fit.",
  },
  {
    src: "/hero/county-park-horses.png",
    alt: "Horses grazing a county park meadow",
    kicker: "Parks",
    title: "Parks belong in the search",
    body: "County park meadows sit in the same list as hundred-acre pasture. Filter, read the listing, then settle the deal yourselves.",
  },
] as const;

export function HomeHero({
  dismissed,
  collapsed,
}: {
  dismissed: boolean;
  collapsed: boolean;
}) {
  const [mode, setMode] = useState<"open" | "collapsed" | "dismissed">(
    dismissed ? "dismissed" : collapsed ? "collapsed" : "open",
  );
  const [index, setIndex] = useState(0);
  const scene = scenes[index];

  function show(next: number) {
    setIndex((next + scenes.length) % scenes.length);
  }

  function collapse() {
    writeIntroCookie(INTRO_COLLAPSED);
    setMode("collapsed");
  }

  function expand() {
    clearIntroCookie();
    setMode("open");
  }

  function dismiss() {
    writeIntroCookie(INTRO_DISMISSED);
    setMode("dismissed");
  }

  return (
    <section aria-label="Introduction" className="border-b">
      {mode !== "dismissed" ? (
        <div
          className="intro-collapse bg-foreground"
          data-open={mode === "open" ? "true" : "false"}
        >
          <div className="intro-collapse-inner" inert={mode === "open" ? undefined : true}>
            <div
              className="relative min-h-[40rem] text-white"
              role="region"
              aria-roledescription="carousel"
              aria-label="How it works"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  show(index + 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  show(index - 1);
                }
              }}
            >
              {scenes.map((item, itemIndex) => (
                <Image
                  key={item.src}
                  src={item.src}
                  alt={itemIndex === index ? item.alt : ""}
                  fill
                  priority={itemIndex === 0}
                  sizes="100vw"
                  className={`object-cover transition-opacity duration-500 ${
                    itemIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.22_0.04_155/0.88)] via-[oklch(0.24_0.04_155/0.62)] to-[oklch(0.2_0.03_155/0.2)]" />
              <div className="relative mx-auto flex min-h-[40rem] max-w-6xl flex-col justify-end gap-8 px-4 py-10 md:py-14">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <ExchangeMark className="size-14 shrink-0" />
                    <p className="text-sm font-medium tracking-wide text-[#F6E2B5]">
                      {PRODUCT_NAME}
                    </p>
                  </div>
                  <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
                    Grazing, matched across the valley.
                  </h1>
                  <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">
                    Ohio, Pennsylvania, Kentucky, and West Virginia. Farm acreage,
                    hardy cover, school yards, and county parks. The Midwest
                    exchange already covers the states on the other side of Indiana.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg">
                      <Link href="/listings">Browse listings</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                      <Link href="/listings/new">Post a listing</Link>
                    </Button>
                  </div>
                </div>

                <div className="max-w-xl rounded-xl border border-white/20 bg-black/35 p-4 backdrop-blur-sm">
                  <p className="text-xs font-medium tracking-wide text-[#F6E2B5] uppercase">
                    {scene.kicker}
                    <span className="sr-only">
                      , scene {index + 1} of {scenes.length}
                    </span>
                  </p>
                  <h2 className="mt-1 text-lg font-semibold" aria-live="polite">
                    {scene.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/85">{scene.body}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5" aria-hidden="true">
                      {scenes.map((item, itemIndex) => (
                        <span
                          key={item.src}
                          className={
                            itemIndex === index
                              ? "h-1.5 w-6 rounded-full bg-[#E2B15A]"
                              : "h-1.5 w-1.5 rounded-full bg-white/50"
                          }
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white"
                        aria-label="Previous scene"
                        onClick={() => show(index - 1)}
                      >
                        <ChevronLeft />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="border-white/40 bg-transparent text-white hover:bg-white/15 hover:text-white"
                        aria-label="Next scene"
                        onClick={() => show(index + 1)}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="border-t bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          {mode === "dismissed" ? (
            <p className="text-sm text-muted-foreground">Intro hidden on this browser.</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {mode === "open" ? "Scenes of grazing in the valley." : "Intro is collapsed for this visit."}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {mode === "open" ? (
              <Button type="button" variant="outline" size="sm" onClick={collapse}>
                <ChevronUp />
                Collapse
              </Button>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={expand}>
                <ChevronDown />
                Show intro
              </Button>
            )}
            {mode !== "dismissed" ? (
              <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
                Hide on future visits
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
