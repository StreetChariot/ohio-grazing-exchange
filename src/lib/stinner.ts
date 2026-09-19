export const STINNER_FIRST_YEAR = 2026;
export const STINNER_FIRST_EDITION = 20;

export type StinnerCannedTopic = {
  key: string;
  title: string;
  intro: string;
};

export type StinnerYear = {
  year: number;
  edition: number;
  theme: string;
  venue: string;
  eventDateLabel: string;
  mainBoardSlug: string;
  chosenBoardSlug: string;
  mainTopics: StinnerCannedTopic[];
  chosenTopics: StinnerCannedTopic[];
};

export function stinnerEditionForYear(year: number) {
  return STINNER_FIRST_EDITION + (year - STINNER_FIRST_YEAR);
}

export function stinnerYearLabel(year: number) {
  const edition = stinnerEditionForYear(year);
  const ordinal =
    edition % 10 === 1 && edition % 100 !== 11
      ? "st"
      : edition % 10 === 2 && edition % 100 !== 12
        ? "nd"
        : edition % 10 === 3 && edition % 100 !== 13
          ? "rd"
          : "th";
  return `${edition}${ordinal} Annual Stinner Summit (${year})`;
}

/** Catalog starts with the 20th (2026). Add a year block when the next Summit opens. */
export const STINNER_YEARS: StinnerYear[] = [
  {
    year: 2026,
    edition: 20,
    theme: "Agroecological collaborations to reduce farm reliance on fossil fuels",
    venue: "Malabar Farm State Park, Lucas, Ohio",
    eventDateLabel: "September 18, 2026",
    mainBoardSlug: "stinner-2026",
    chosenBoardSlug: "stinner-2026-chosen",
    mainTopics: [
      {
        key: "welcome",
        title: "Welcome and how this Summit works",
        intro:
          "Orientation for the 20th Annual Stinner Summit. Share who you are, what you brought, and how the day is meant to move from ideas to projects the endowment can support.",
      },
      {
        key: "fossil-inputs",
        title: "Fossil-fuel input pressure on farms",
        intro:
          "Where price, supply, and regulation are hitting operations hardest — fuel, fertilizer, plastics, transport, and the rest of the petroleum stack.",
      },
      {
        key: "agroecology",
        title: "Agroecological and regenerative approaches",
        intro:
          "Practices that cut the need for purchased inputs: grazing, covers, rotations, soil, and on-farm cycling.",
      },
      {
        key: "energy",
        title: "Alternative fuels and on-farm energy",
        intro:
          "Biofuels, electrification, efficiency, and generation that belong on the farm or in the local food chain.",
      },
      {
        key: "supply-chains",
        title: "Local food supply chains and efficiency",
        intro:
          "Processing, distribution, and storage moves that shrink fossil miles without stranding farmers.",
      },
      {
        key: "endowment-ideas",
        title: "Project ideas for the Stinner Endowment",
        intro:
          "Draft proposals and coalitions before and after the Malabar day. Keep asks concrete enough to prioritize.",
      },
      {
        key: "logistics",
        title: "Logistics: Malabar Farm, Sept 18, 2026",
        intro:
          "Registration, arrival, accessibility, and day-of coordination for the Summit at Malabar Farm State Park.",
      },
    ],
    chosenTopics: [
      {
        key: "chosen-overview",
        title: "2026 Chosen Projects overview",
        intro:
          "The projects selected from the 20th Summit process. Post summaries, leads, and links here so the Valley can follow along.",
      },
      {
        key: "chosen-updates",
        title: "Project updates",
        intro:
          "Progress, setbacks, field days, and milestones from Chosen Projects after the Summit.",
      },
      {
        key: "chosen-collab",
        title: "Collaboration asks",
        intro:
          "Where Chosen Project teams need grazers, land, research help, policy partners, or co-op channels.",
      },
    ],
  },
];

export function stinnerYearByBoardSlug(slug: string | null | undefined) {
  if (!slug) return null;
  return (
    STINNER_YEARS.find(
      (year) => year.mainBoardSlug === slug || year.chosenBoardSlug === slug,
    ) ?? null
  );
}

export function isStinnerBoardSlug(slug: string | null | undefined) {
  return Boolean(stinnerYearByBoardSlug(slug));
}

export function isStinnerChosenBoard(slug: string | null | undefined) {
  return STINNER_YEARS.some((year) => year.chosenBoardSlug === slug);
}

export function cannedTopicsForBoard(slug: string | null | undefined) {
  const year = stinnerYearByBoardSlug(slug);
  if (!year || !slug) return [];
  if (slug === year.chosenBoardSlug) return year.chosenTopics;
  if (slug === year.mainBoardSlug) return year.mainTopics;
  return [];
}

export function stinnerBoardMeta(slug: string) {
  const year = stinnerYearByBoardSlug(slug);
  if (!year) return null;
  const chosen = slug === year.chosenBoardSlug;
  return {
    year: year.year,
    edition: year.edition,
    theme: year.theme,
    venue: year.venue,
    eventDateLabel: year.eventDateLabel,
    chosen,
    title: chosen
      ? `Chosen Projects · ${year.year}`
      : stinnerYearLabel(year.year),
    description: chosen
      ? `Lane for projects chosen from the ${year.edition}th Stinner Summit (${year.year}).`
      : `${year.theme}. ${year.eventDateLabel} · ${year.venue}.`,
    siblingSlug: chosen ? year.mainBoardSlug : year.chosenBoardSlug,
    siblingLabel: chosen ? stinnerYearLabel(year.year) : `Chosen Projects · ${year.year}`,
  };
}
