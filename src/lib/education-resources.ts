/**
 * Curated Education shelf for the Exchange.
 * Summaries are ours; full text lives on the source site. Always link out
 * and credit authors / publishers — do not mirror copyrighted articles.
 */

import type { OrganizationSlug } from "@/lib/organizations";

export const EDUCATION_TOPICS = [
  "cover-crops",
  "livestock-integration",
  "fossil-fuel-reduction",
  "managed-grazing",
  "equipment-energy",
  "silvopasture",
] as const;

export type EducationTopic = (typeof EDUCATION_TOPICS)[number];

export const EDUCATION_TOPIC_LABELS: Record<EducationTopic, string> = {
  "cover-crops": "Cover crops & forage",
  "livestock-integration": "Integrating livestock",
  "fossil-fuel-reduction": "Cutting fossil-fuel inputs",
  "managed-grazing": "Managed grazing",
  "equipment-energy": "Equipment & on-farm energy",
  silvopasture: "Silvopasture",
};

export const EDUCATION_TOPIC_BLURBS: Record<EducationTopic, string> = {
  "cover-crops":
    "Species choice, rotations, and grazing covers so cropland stays living between cash crops.",
  "livestock-integration":
    "Bringing animals back onto crop fields — residue, covers, and whole-farm reintegration.",
  "fossil-fuel-reduction":
    "Less diesel, fertilizer N, and mechanical harvest through grazing, no-till, and input efficiency.",
  "managed-grazing":
    "Rotational and management-intensive grazing that protects soil while extending the season.",
  "equipment-energy":
    "Fuel-saving tractor practices, no-till diesel cuts, and early alternative-power research.",
  silvopasture:
    "Trees and livestock together — shade, forage, wildlife habitat, and Appalachian working-woods systems.",
};

/** Partner orgs that publish Education shelf items (for filters). */
export const EDUCATION_SOURCE_ORGS = [
  "osu-extension",
  "psu-extension",
  "uk-extension",
  "wvu-extension",
  "sare",
  "oeffa",
  "stratford",
] as const satisfies readonly OrganizationSlug[];

export type EducationSourceOrg = (typeof EDUCATION_SOURCE_ORGS)[number];

export type EducationResource = {
  id: string;
  title: string;
  /** Short Exchange-written teaser; never a verbatim reprint. */
  summary: string;
  authors: string[];
  sourceOrg: EducationSourceOrg;
  sourceLabel: string;
  url: string;
  publishedLabel?: string;
  topics: EducationTopic[];
};

export const EDUCATION_RESOURCES: EducationResource[] = [
  // —— OSU Extension ——
  {
    id: "osu-sag-9",
    title: "Sustainable Crop Rotations with Cover Crops",
    summary:
      "Ohioline fact sheet on cover species after wheat, soybeans, corn, and silage — including which grasses and brassicas work for grazing while building soil and recycling nutrients.",
    authors: ["James J. Hoorman", "Rafiq Islam", "Alan Sundermeier"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/SAG-9",
    publishedLabel: "May 2009",
    topics: ["cover-crops", "livestock-integration"],
  },
  {
    id: "osu-beef-cover-fertilizer",
    title: "Do Cover Crops Grown for Feed Need Fertilizer?",
    summary:
      "Argues strip-grazing covers beats mechanical harvest for nutrient return and machinery cost, and when soil tests plus livestock redeposit mean fertilizer can stay off.",
    authors: ["Christine Gelley"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohio BEEF Cattle Letter · OSU Extension",
    url: "https://u.osu.edu/beef/2019/12/04/do-cover-crops-grown-for-feed-need-fertilizer/",
    publishedLabel: "December 2019",
    topics: ["cover-crops", "livestock-integration", "fossil-fuel-reduction"],
  },
  {
    id: "osu-anr-0160",
    title: "Grazing Intensity and Move Frequency for Rotational Systems",
    summary:
      "How hard and how often to graze: rotational systems average ~30% more forage, temporary fence and portable water for flexibility, and sacrificial paddocks when soils are wet.",
    authors: ["Kyle Verhoff", "Jason Hartschuh"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/anr-0160",
    publishedLabel: "February 2025",
    topics: ["managed-grazing"],
  },
  {
    id: "osu-anr-0185",
    title: "Stockpiling Cool-Season Grasses with Fall Nitrogen",
    summary:
      "Tall fescue stockpile for late fall and winter: when to shut the gate, N timing/rate, clover dilutions, and strip-grazing a three-day allocation to roughly double grazing days vs. continuous access.",
    authors: ["Ted Wiseman", "Dan Lima"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/anr-0185",
    publishedLabel: "June 2025",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },
  {
    id: "osu-anr-0159",
    title: "Giving New Life to Tired Pastures",
    summary:
      "Restoring overgrazed Ohio pastures: residual heights, rest periods, and rotational timing so plants stay vegetative and roots rebuild instead of opening ground to weeds.",
    authors: ["Dean Kreager", "Christine Gelley", "Theodore Wiseman"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/anr-0159",
    topics: ["managed-grazing"],
  },
  {
    id: "osu-anr-0166",
    title: "Targeted Grazing of Native Warm-Season Grasses",
    summary:
      "Height and removal-rate targets for warm-season natives vs. cool-season mixes — more frequent, lighter bites keep green leaf and quality up across the Ohio growing season.",
    authors: [
      "Alexandre Fameli Mammana",
      "Emanoella Otaviano",
      "Ricardo Henrique Ribeiro",
      "Marília B. Chiavegato",
    ],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/anr-0166",
    topics: ["managed-grazing", "cover-crops"],
  },
  {
    id: "osu-anr-84",
    title: "Post Corn, Going to Soybean: Use Cereal Rye",
    summary:
      "Midwest Cover Crops Council “recipe” for cereal rye after corn ahead of soy — no-till friendly, grazing/feed restrictions noted, and terminate early in dry springs.",
    authors: ["Midwest Cover Crops Council", "Ohio State University Extension"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/anr-84",
    topics: ["cover-crops"],
  },
  {
    id: "osu-anr-0168",
    title: "Attributes of Cereal Rye as a Cover Crop",
    summary:
      "Why rye dominates Ohio covers: nutrient scavenging, aggregate stability, weed suppression, and how planting method and termination timing change the risk profile.",
    authors: ["Ohio State University Extension"],
    sourceOrg: "osu-extension",
    sourceLabel: "Ohioline · Ohio State University Extension",
    url: "https://ohioline.osu.edu/factsheet/anr-0168",
    topics: ["cover-crops"],
  },
  {
    id: "osu-ideas-integration",
    title: "IDEAS Crop and Livestock Integration Project",
    summary:
      "On-farm study across eight Ohio counties comparing modes of crop–livestock integration; perennials and manure stood out for soil biological health. Team is building Extension recommendations from the work.",
    authors: [
      "Doug Jackson-Smith",
      "Marilia Chiavegato",
      "Ryan Haden",
      "Steve Lyon",
      "Ajay Shah",
      "Cassandra Brown",
    ],
    sourceOrg: "osu-extension",
    sourceLabel: "Agroecosystem Management Program · The Ohio State University",
    url: "https://amp.osu.edu/research/ideas-crop-and-livestock-integration",
    topics: ["livestock-integration", "cover-crops", "fossil-fuel-reduction"],
  },
  {
    id: "osu-car-hybrid-tractor",
    title: "A more efficient harvest (hybrid tractor research)",
    summary:
      "OSU automotive / FABE work on hybrid off-road tractors — full battery packs still struggle at high horsepower; hybrids cut fuel use up to about 21% in tested duty cycles.",
    authors: [
      "Center for Automotive Research",
      "Food, Agricultural and Biological Engineering",
    ],
    sourceOrg: "osu-extension",
    sourceLabel: "The Ohio State University · Center for Automotive Research",
    url: "https://car.osu.edu/news/2026/01/more-efficient-harvest",
    publishedLabel: "January 2026",
    topics: ["equipment-energy", "fossil-fuel-reduction"],
  },

  // —— Penn State Extension ——
  {
    id: "psu-grazing-covers-soil",
    title: "Integrating Grazing into Cropping Systems: Grazing Cover Crops for Soil Health",
    summary:
      "Five soil-health principles for grazing covers: armor, no-till, diversity, living roots, and livestock. Emphasizes take-half/leave-half, frequent moves, and avoiding wet pugging.",
    authors: [
      "Sjoerd W. Duiker",
      "David W. Hartman",
      "Kathy J. Soder",
      "Justin L. Brackenrich",
      "Divya Pant",
    ],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/integrating-grazing-into-cropping-systems-grazing-cover-crops-for-soil-health",
    publishedLabel: "Updated October 2022",
    topics: ["cover-crops", "livestock-integration", "managed-grazing"],
  },
  {
    id: "psu-intensive-grazing-covers",
    title: "Intensive Grazing Management of Cover Crops for Soil Health",
    summary:
      "On-farm Adams and Franklin County results: MiG moves every 1–2 days delivered ~1,200–2,300 lb/acre DM while leaving about half the residue; bulk density recovered and soil biology often improved.",
    authors: ["Sjoerd W. Duiker", "Divya Pant"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/intensive-grazing-management-of-cover-crops-for-soil-health",
    topics: ["cover-crops", "managed-grazing", "livestock-integration"],
  },
  {
    id: "psu-grazing-notill",
    title: "Potential to Integrate Grazing into No-Till Systems",
    summary:
      "Perennial–annual rotations, grazed covers, and residue grazing on continuous no-till — grazed forage often costs half or less of machine-harvested feed, with no manure-spreading pass.",
    authors: ["Sjoerd W. Duiker", "Jessica A. Williamson"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/potential-to-integrate-grazing-into-no-till-systems/",
    publishedLabel: "Updated September 2025",
    topics: [
      "livestock-integration",
      "cover-crops",
      "fossil-fuel-reduction",
      "managed-grazing",
    ],
  },
  {
    id: "psu-stockpile-soil",
    title: "Stockpile Grazing and Soil Health",
    summary:
      "Rest cool-season perennials 60–70 days before frost, then winter-graze the standing feed — with notes on puddling risk and how biology repairs surface compaction.",
    authors: ["Sjoerd W. Duiker"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/stockpile-grazing-and-soil-health",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },
  {
    id: "psu-stockpile-fall",
    title: "Extending the Grazing Season – Stockpiling Pastures for Fall Grazing",
    summary:
      "Defer grazing from late July/early August, choose stockpile-friendly species (tall fescue, brome, birdsfoot trefoil), and cut winter hay/hauling costs for 2–3 months.",
    authors: ["Jessica A. Williamson"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/extending-the-grazing-season-stockpiling-pastures-for-fall-grazing",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },
  {
    id: "psu-extend-diversity",
    title: "Extending the Grazing Season with Plant Diversity",
    summary:
      "Warm-season annuals and perennials plus cool-season annuals fill summer slumps and free perennial paddocks to stockpile — no-till makes the rotations practical.",
    authors: ["Sjoerd W. Duiker", "Jessica A. Williamson"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/extending-the-grazing-season-with-plant-diversity",
    topics: ["managed-grazing", "cover-crops", "livestock-integration"],
  },
  {
    id: "psu-plant-diversity-300",
    title: "Plant Diversity to Extend the Grazing Season",
    summary:
      "Case-style look at stacking cool- and warm-season perennials and annuals toward nearly 300 grazing days a year while resting paddocks for stockpile.",
    authors: ["Sjoerd W. Duiker", "Jessica A. Williamson"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State Extension",
    url: "https://extension.psu.edu/plant-diversity-to-extend-the-grazing-season",
    topics: ["managed-grazing", "cover-crops"],
  },
  {
    id: "psu-fuel-fertilizer-tips",
    title: "Tips to save farmers money on fuel and fertilizer",
    summary:
      "Practical diesel cuts: gear up / throttle down, match tractor to the job, economy PTO, kill idle, and continuous no-till (~3.6 gal/acre less fuel). Cover legumes credit 30–40 lb N/acre.",
    authors: ["Andrew Frankenfield"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State University · College of Agricultural Sciences",
    url: "https://www.psu.edu/news/agricultural-sciences/story/extension-agronomist-provides-tips-save-farmers-money-fuel-and",
    publishedLabel: "May 2026",
    topics: ["fossil-fuel-reduction", "equipment-energy", "cover-crops"],
  },
  {
    id: "psu-methane-tractor",
    title: "Natural gas-powered tractor for ag science research at Penn State",
    summary:
      "New Holland T6.180 methane tractor on campus for tillage, planting, haying, and Extension teaching — an alternative path off diesel where digester or landfill gas is available.",
    authors: ["Penn State College of Agricultural Sciences", "CNH / New Holland"],
    sourceOrg: "psu-extension",
    sourceLabel: "Penn State University",
    url: "https://www.psu.edu/news/agricultural-sciences/story/natural-gas-powered-tractor-boost-ag-science-research-penn-state",
    topics: ["equipment-energy", "fossil-fuel-reduction"],
  },

  // —— UK Extension ——
  {
    id: "uk-grazing-cover-crops",
    title: "Grazing Cover Crops",
    summary:
      "Master Grazer guidance for KY: wheat and cereal rye mixes, fencing realities on cropland, which cattle classes pay, and contracting with a neighbor when you lack the planter.",
    authors: ["Ray Smith", "Christopher Teutsch", "Jeff Lehmkuhler"],
    sourceOrg: "uk-extension",
    sourceLabel: "UK Master Grazer · University of Kentucky Extension",
    url: "https://grazer.mgcafe.uky.edu/grazing-cover-crops",
    topics: ["cover-crops", "livestock-integration", "managed-grazing"],
  },
  {
    id: "uk-stockpile-fescue",
    title: "Stockpiling Tall Fescue",
    summary:
      "Every day on stockpiled fescue saves hay, labor, and equipment — quality holds through frost better than most cool-season grasses; strip-graze for maximum days.",
    authors: ["Ray Smith", "Christopher Teutsch", "Jeff Lehmkuhler"],
    sourceOrg: "uk-extension",
    sourceLabel: "UK Master Grazer · University of Kentucky Extension",
    url: "https://grazer.mgcafe.uky.edu/stockpiling-tall-fescue",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },
  {
    id: "uk-id-143",
    title: "Rotational Grazing (ID-143)",
    summary:
      "Classic UK Cooperative Extension bulletin: rotational grazing cuts machinery, fuel, and facility cost while improving utilization, waste distribution, and season length.",
    authors: [
      "Ray Smith",
      "Garry Lacefield",
      "Roy Burris",
      "David Ditsch",
      "Bob Coleman",
      "Jeff Lehmkuhler",
      "Jimmy Henning",
    ],
    sourceOrg: "uk-extension",
    sourceLabel: "University of Kentucky Cooperative Extension",
    url: "https://publications.mgcafe.uky.edu/files/ID143.pdf",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },
  {
    id: "uk-agr-199",
    title: "Extending Grazing and Reducing Stored Feed Needs (AGR-199)",
    summary:
      "Southern Extension classic: warm-/cool-season mixes, stockpile math (~80 cow-days/acre at 70% efficiency), crop residue, dormant alfalfa, and strip grazing to shrink hay dependence.",
    authors: [
      "Don Ball",
      "Ed Ballard",
      "Mark Kennedy",
      "Garry Lacefield",
      "Dan Undersander",
    ],
    sourceOrg: "uk-extension",
    sourceLabel: "University of Kentucky Cooperative Extension",
    url: "https://forages.mgcafe.uky.edu/files/extending_grazing_and_reducing_stored_feed_needs.pdf",
    topics: ["managed-grazing", "fossil-fuel-reduction", "livestock-integration"],
  },
  {
    id: "uk-agr-160",
    title: "Managing Small Grains for Livestock Forage (AGR-160)",
    summary:
      "Wheat, barley, oat, rye, and triticale as dual-purpose grain, cover, and livestock forage — grazing, silage, and hay while scavenging residual N after summer annuals.",
    authors: ["University of Kentucky Forage Extension"],
    sourceOrg: "uk-extension",
    sourceLabel: "University of Kentucky Cooperative Extension",
    url: "https://forages.mgcafe.uky.edu/files/small_grains_for_forage_agr160.pdf",
    topics: ["cover-crops", "livestock-integration"],
  },

  // —— WVU Extension ——
  {
    id: "wvu-quick-grazing",
    title: "A Quick Guide to Pasture and Grazing Management",
    summary:
      "Three principles — fertility, timing/intensity, and matching forage supply to demand. Move at 8–12 inches in and 2–4 inches out; never leave animals on a paddock more than seven days.",
    authors: ["Ed Rayburn"],
    sourceOrg: "wvu-extension",
    sourceLabel: "WVU Extension Service",
    url: "https://extension.wvu.edu/files/d/433da63a-9773-41f0-9a1e-9ff1e6a389d1/a-quick-guide-to-pasture-and-grazing-management-digital.pdf",
    publishedLabel: "July 2017",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },
  {
    id: "wvu-grass-project",
    title: "Grazing for Appalachian Sustainability (GRASS)",
    summary:
      "USDA-backed WVU Extension project helping beef and sheep producers shift to soil-health grazing — prescribed grazing, fencing, watering, silvopasture, and related NRCS practices.",
    authors: ["WVU Extension"],
    sourceOrg: "wvu-extension",
    sourceLabel: "WVU Extension",
    url: "https://extension.wvu.edu/agriculture/pasture-hay-forage/grazing-for-appalachian-sustainability",
    topics: ["managed-grazing", "livestock-integration", "silvopasture"],
  },
  {
    id: "wvu-cover-crops",
    title: "Cover Crops",
    summary:
      "WVU overview of grasses, legumes, and brassicas as living armor — including using covers as livestock feed, not only green manure.",
    authors: ["WVU Extension"],
    sourceOrg: "wvu-extension",
    sourceLabel: "WVU Extension",
    url: "https://extension.wvu.edu/lawn-gardening-pests/gardening/garden-management/cover-crops",
    topics: ["cover-crops"],
  },
  {
    id: "wvu-pasture-hub",
    title: "Pasture Management (resource hub)",
    summary:
      "Index of WVU pasture sheets: fencing, watering, stockpile, stocking rate, plate meters, and extending the grazing season to cut stored-feed costs.",
    authors: ["WVU Extension"],
    sourceOrg: "wvu-extension",
    sourceLabel: "WVU Extension",
    url: "https://extension.wvu.edu/agriculture/pasture-hay-forage/pasture-management",
    topics: ["managed-grazing", "fossil-fuel-reduction"],
  },

  // —— SARE ——
  {
    id: "sare-crops-livestock",
    title: "Let’s Talk! Integrating Crops & Livestock (infographic narrative)",
    summary:
      "Spectrum from hauling cover forage to temporary fence and in-field grazing — grazing cuts fuel, equipment wear, and manure-handling compared with mechanical harvest and feedlot feeding.",
    authors: ["Green Lands Blue Waters", "SARE"],
    sourceOrg: "sare",
    sourceLabel: "USDA Sustainable Agriculture Research and Education (SARE)",
    url: "https://projects.sare.org/media/pdf/C/r/o/Crops_Livestock_Infographic_plus_narrative_Web_051622.pdf",
    publishedLabel: "2022",
    topics: [
      "livestock-integration",
      "cover-crops",
      "fossil-fuel-reduction",
      "managed-grazing",
    ],
  },
  {
    id: "sare-mfa-integration",
    title: "Maximizing Integrated Crop & Livestock Systems Value",
    summary:
      "Midwest Forage Association piece from a SARE-funded project: grazing aftermath and covers saves stored feed, labor, and manure handling that enterprise accounting often misses.",
    authors: ["Laura Paine", "Amy Fenn", "Jane Jewett", "Erin Meier"],
    sourceOrg: "sare",
    sourceLabel: "SARE / Green Lands Blue Waters",
    url: "https://projects.sare.org/media/pdf/2/0/2/2022_08_01-midwest-forage-assn-article.pdf",
    publishedLabel: "August 2022",
    topics: ["livestock-integration", "fossil-fuel-reduction", "cover-crops"],
  },

  // —— OEFFA / OOFRN / partner tours ——
  {
    id: "oeffa-silvopasture-seminar",
    title: "Soil Health, Silvopasture, and Other Grazing Adaptations",
    summary:
      "Ohio Organic Farmer Researcher Network seminar with Wayne County farmer Matt Falb on silvopasture and grazing covers on neighboring farms — OEFFA / Central State / OSU collaboration.",
    authors: ["Matt Falb", "Ohio Organic Farmer Researcher Network"],
    sourceOrg: "oeffa",
    sourceLabel: "OEFFA · Ohio Organic Farmer Researcher Network",
    url: "https://grow.oeffa.org/event/soil-health-silvopasture-and-other-grazing-adaptations/",
    publishedLabel: "June 2025 event archive",
    topics: ["livestock-integration", "managed-grazing", "cover-crops", "silvopasture"],
  },
  {
    id: "oeffa-cover-grazing-tnc",
    title: "Cover Crops and Grazing (Ohio No-Till / TNC field day)",
    summary:
      "Listed on OEFFA’s calendar: Ohio No-Till Council and The Nature Conservancy soil-health field day tying regenerative covers to grazing — gateway to TNC Ohio ag programming.",
    authors: ["Ohio No-Till Council", "The Nature Conservancy"],
    sourceOrg: "oeffa",
    sourceLabel: "OEFFA events · Ohio No-Till / TNC",
    url: "https://grow.oeffa.org/event/cover-crops-and-grazing/",
    publishedLabel: "June field day archive",
    topics: ["cover-crops", "livestock-integration", "managed-grazing"],
  },
  {
    id: "oeffa-silvopasture-buckskin",
    title: "Silvopasture in Practice: Buckskin Valley Farms tour",
    summary:
      "Charlie Eselgroth’s dairy planting trees into pasture for shade, tree crops, and habitat — Rural Action on hand for technical assistance and funding paths.",
    authors: ["Charlie Eselgroth", "Rural Action"],
    sourceOrg: "oeffa",
    sourceLabel: "OEFFA events · Rural Action",
    url: "https://grow.oeffa.org/event/silvopasture-in-practice-farm-tour/",
    publishedLabel: "August 2025",
    topics: ["silvopasture", "managed-grazing", "livestock-integration"],
  },
  {
    id: "oeffa-silvopasture-hidden-creek",
    title: "Silvopasture Tour: Hidden Creek Pasture",
    summary:
      "Seven-acre silvopasture on a Noble County pastured beef and chicken farm — Wendall and Carla Miller’s managed grazing on rolling woods and pasture.",
    authors: ["Wendall Miller", "Carla Miller", "Rural Action"],
    sourceOrg: "oeffa",
    sourceLabel: "OEFFA events · Rural Action",
    url: "https://grow.oeffa.org/event/silvopasture-tour-hidden-creek-pasture/",
    topics: ["silvopasture", "managed-grazing"],
  },
  {
    id: "oeffa-grim-dairy-tour",
    title: "Grazing Innovations and Opportunities (Grim Dairy)",
    summary:
      "Eric Grim on dairy grazing infrastructure, Pasture.io forage tracking, and Dairy Grazing Apprenticeship paths — OEFFA Farm Tour with OOFRN.",
    authors: ["Eric Grim", "Dairy Grazing Apprenticeship", "OEFFA"],
    sourceOrg: "oeffa",
    sourceLabel: "OEFFA Farm Tour Series",
    url: "https://grow.oeffa.org/event/grazing-innovations-and-opportunities-farm-tour/",
    topics: ["managed-grazing", "livestock-integration"],
  },
  {
    id: "oeffa-ask-educator",
    title: "Ask an OEFFA educator",
    summary:
      "Help desk for soil health, covers, organic transition, USDA programs, and sustainable production — John and Adam’s team as a living education resource.",
    authors: ["OEFFA Education Team"],
    sourceOrg: "oeffa",
    sourceLabel: "Ohio Ecological Food and Farm Association",
    url: "https://grow.oeffa.org/support/",
    topics: ["cover-crops", "livestock-integration"],
  },

  // —— Stratford Ecological Center ——
  {
    id: "stratford-no-till-grazing",
    title: "Life on the farm: no-till drill, roller/crimper, and pasture dividers",
    summary:
      "Pauline Scott’s farm journal: permanent pasture dividers for better grazing patterns, early season clover/alfalfa grazing, and a donated Great Plains no-till drill plus roller/crimper so Farmer Jeff can plant into covers without tillage.",
    authors: ["Pauline Scott", "Farmer Jeff"],
    sourceOrg: "stratford",
    sourceLabel: "Stratford Ecological Center",
    url: "https://stratfordecologicalcenter.org/life-into-high-gear/",
    publishedLabel: "May 2023",
    topics: [
      "managed-grazing",
      "cover-crops",
      "equipment-energy",
      "fossil-fuel-reduction",
      "livestock-integration",
    ],
  },
  {
    id: "stratford-home",
    title: "Stratford Ecological Center — educational farm & preserve",
    summary:
      "236-acre certified organic demonstration farm and nature preserve in Delaware County: livestock, gardens, 8-year rotations, and hands-on programs for children and adults.",
    authors: ["Stratford Ecological Center"],
    sourceOrg: "stratford",
    sourceLabel: "Stratford Ecological Center",
    url: "https://stratfordecologicalcenter.org/",
    topics: ["livestock-integration", "managed-grazing", "cover-crops"],
  },
  {
    id: "stratford-field-trips",
    title: "Stratford field trips and outdoor classroom",
    summary:
      "Guided farm and nature learning — animals, sustainable practices, and where food comes from — for schools booking the outdoor classroom.",
    authors: ["Stratford Ecological Center"],
    sourceOrg: "stratford",
    sourceLabel: "Stratford Ecological Center",
    url: "https://stratfordecologicalcenter.org/field-trips/",
    topics: ["livestock-integration"],
  },
];

export function isEducationTopic(value: string | null | undefined): value is EducationTopic {
  return !!value && (EDUCATION_TOPICS as readonly string[]).includes(value);
}

export function isEducationSourceOrg(
  value: string | null | undefined,
): value is EducationSourceOrg {
  return !!value && (EDUCATION_SOURCE_ORGS as readonly string[]).includes(value);
}

export function filterEducationResources(opts: {
  topic?: EducationTopic | "all";
  source?: EducationSourceOrg | "all";
}) {
  const topic = opts.topic ?? "all";
  const source = opts.source ?? "all";
  return EDUCATION_RESOURCES.filter((r) => {
    if (topic !== "all" && !r.topics.includes(topic)) return false;
    if (source !== "all" && r.sourceOrg !== source) return false;
    return true;
  });
}

export function educationResourceCountsByOrg() {
  const counts = new Map<EducationSourceOrg, number>();
  for (const r of EDUCATION_RESOURCES) {
    counts.set(r.sourceOrg, (counts.get(r.sourceOrg) ?? 0) + 1);
  }
  return counts;
}

export function formatAuthorList(authors: readonly string[]) {
  if (authors.length === 0) return "Authors not listed on source";
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors.slice(0, -1).join(", ")}, and ${authors[authors.length - 1]}`;
}
