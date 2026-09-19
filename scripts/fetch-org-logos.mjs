/**
 * Curated official logo sources for partner orgs and NOP certifiers.
 * Downloads originals, then writes padded square PNGs at sm/md/lg.
 *
 * Sizes match OrgMark CSS: sm=28 (size-7), md=36 (size-9), lg=64 (partners cards).
 */
import { createWriteStream } from "node:fs";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "org-logos");
const RAW = join(OUT, "_raw");

const SIZES = { sm: 56, md: 72, lg: 128 }; // 2x retina for 28/36/64 CSS px

/** @type {Record<string, { url: string; source: string; note?: string }>} */
const SOURCES = {
  // Organizations
  usda: {
    url: "https://www.usda.gov/themes/custom/usda_uswds/img/usda-symbol.svg",
    source: "https://www.usda.gov/",
  },
  "usda-nop": {
    url: "https://www.ams.usda.gov/sites/default/files/media/Organic4colorsealJPG.jpg",
    source: "https://www.ams.usda.gov/rules-regulations/organic/organic-seal",
  },
  oeffa: {
    url: "https://grow.oeffa.org/wp-content/uploads/2023/06/oeffalogo.jpg",
    source: "https://grow.oeffa.org/",
  },
  sare: {
    url: "https://www.sare.org/wp-content/uploads/SARE-logo-below.jpg",
    source: "https://www.sare.org/",
  },
  "osu-extension": {
    url: "https://extension.osu.edu/sites/all/themes/cfaesbase/images/logos/horiz300.jpg",
    source: "https://extension.osu.edu/",
  },
  "psu-extension": {
    url: "https://extension.psu.edu/static/version1789030012/frontend/BlueAcorn/site/en_US/images/logo.svg",
    source: "https://extension.psu.edu/",
    note: "Normalized onto a white plate for light UI backgrounds.",
  },
  "uk-extension": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/University_of_Kentucky_logo.svg",
    source: "https://brand.uky.edu/our-identity/university-logo",
    note: "UK brand mark via Wikimedia (official downloads require campus auth).",
  },
  "wvu-extension": {
    url: "https://commons.wikimedia.org/wiki/Special:FilePath/WVU_flying_WV_Gold124.svg",
    source: "https://scm.wvu.edu/brand/logo-and-identity-usage/",
  },
  stratford: {
    url: "https://stratfordecologicalcenter.org/wp-content/uploads/2021/04/logo.png",
    source: "https://www.stratfordecologicalcenter.org/",
  },
  "organic-valley": {
    url: "https://www.organicvalley.coop/logo.svg",
    source: "https://www.organicvalley.coop/",
  },
  "farmers-union": {
    url: "https://nfu.org/wp-content/uploads/2025/06/Logo.svg",
    source: "https://nfu.org/",
  },
  pco: {
    url: "https://images.squarespace-cdn.com/content/v1/688bab318f83700beea28132/7a3e7ac8-e60c-4bfb-adca-cb0574bbb360/Resized_Site1+Site+Title+Logo.png?format=500w",
    source: "https://www.paorganic.org/",
  },

  // Certifiers (reuse org logos where shared)
  kda: {
    url: "https://www.kyagr.com/images/kyagr-logo-2024-LG.png",
    source: "https://www.kyagr.com/",
  },
  mosa: {
    url: "https://mosaorganic.org/images/mosa-logo.svg",
    source: "https://mosaorganic.org/",
  },
  ocia: {
    url: "https://ocia.org/wp-content/uploads/2019/06/logo.png",
    source: "https://www.ocia.org/",
  },
  "nofa-ny": {
    url: "https://web.archive.org/web/20241222205843im_/https://nofany.org/wp-content/uploads/2019/10/NOFA_logo.png",
    source: "https://nofany.org/",
    note: "Official NOFA-NY logo via Internet Archive (live site returns 403 to bots).",
  },
  otco: {
    url: "https://tilth.org/wp-content/themes/tilth-2017/dist/images/tilth-logo.svg",
    source: "https://tilth.org/",
  },
  qcs: {
    url: "https://qcsinfo.org/wp-content/themes/QCS/assets/images/qcs_logo.svg",
    source: "https://www.qcsinfo.org/",
  },
  qai: {
    url: "https://www.qai-inc.com/images/qai_logo.svg",
    source: "https://www.qai-inc.com/",
  },
  onecert: {
    url: "https://onecert.com/images/logo-primary.png",
    source: "https://www.onecert.com/",
  },
  nics: {
    url: "https://www.naturesinternational.com/Images/NICS_Logo-removebg.png",
    source: "https://www.naturesinternational.com/",
  },
  scs: {
    url: "https://www.scsglobalservices.com/themes/global3/images/scsglobalservices_logo.svg",
    source: "https://www.scsglobalservices.com/",
  },
  "organic-certifiers": {
    url: "https://static.wixstatic.com/media/77d1b3_32eda7f9a951413bac9d35dec544ddcc~mv2.jpg/v1/fill/w_400,h_380,al_c,q_80,enc_auto/Organic%20Certifiers%20Logo%20black.jpg",
    source: "https://www.organiccertifiers.com/",
  },
  mda: {
    url: "https://mda.maryland.gov/Style%20Library/egov/img/agencyLogoMDA_logo3.png",
    source: "https://mda.maryland.gov/",
  },
  vof: {
    url: "https://vermontorganic.org/sites/default/files/inline-images/VOF_Logo_CMYK_Color.png",
    source: "https://vermontorganic.org/",
  },
  mofga: {
    url: "https://www.mofga.org/wp-content/uploads/2020/11/footer-logo-mofga.png",
    source: "https://www.mofga.org/",
  },
  ccof: {
    url: "https://www.ccof.org/wp-content/uploads/2024/02/ccof-logo.svg",
    source: "https://www.ccof.org/",
  },
  // stellar + americert: no reliable official logo asset available — text mark fallback.
};

const ALTERNATES = {
  "uk-extension": [
    "https://commons.wikimedia.org/wiki/Special:FilePath/University_of_Kentucky_logo.svg",
  ],
  "wvu-extension": [
    "https://static.wvu.edu/global/images/logos/wvu/flying-wv-r-small--1.0.0.svg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/WVU_flying_WV_Gold124.svg",
    "https://commons.wikimedia.org/wiki/Special:FilePath/West_Virginia_University_logo.svg",
  ],
  "nofa-ny": [
    "https://web.archive.org/web/20241222205843im_/https://nofany.org/wp-content/uploads/2019/10/NOFA_logo.png",
    "https://web.archive.org/web/20241222205843im_/https://nofany.org/wp-content/uploads/2019/10/NOFA_logo-white.png",
  ],
  pco: [
    "https://images.squarespace-cdn.com/content/v1/688bab318f83700beea28132/0b346396-2ac0-4064-9629-35a79a2b905d/PCO_BrandIdentity_FINAL_Vertical_White+copy.png",
  ],
  sare: ["https://www.sare.org/wp-content/uploads/SARE-logo-below.jpg"],
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function download(url, dest) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (type.includes("text/html")) throw new Error("Got HTML instead of image");
  await mkdir(dirname(dest), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) throw new Error("File too small");
  await writeFile(dest, buf);
  return { bytes: buf.length, type };
}

async function downloadFirst(slug, primary, alternates = []) {
  const candidates = [primary, ...alternates];
  const errors = [];
  for (const url of candidates) {
    const ext = url.includes(".svg")
      ? "svg"
      : url.includes(".gif")
        ? "gif"
        : url.includes(".jpg") || url.includes(".jpeg")
          ? "jpg"
          : "png";
    const dest = join(RAW, `${slug}.${ext}`);
    try {
      const meta = await download(url, dest);
      return { dest, url, ...meta };
    } catch (e) {
      errors.push(`${url} → ${e.message}`);
    }
  }
  throw new Error(errors.join(" | "));
}

async function knockOutNearBlack(buf, threshold = 28) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < threshold && data[i + 1] < threshold && data[i + 2] < threshold) {
      data[i + 3] = 0;
    }
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function normalize(inputPath, slug) {
  const image = sharp(inputPath, { animated: false, density: 300 });
  const meta = await image.metadata();
  const maxSide = Math.max(meta.width || 1, meta.height || 1);
  const pad = Math.ceil(maxSide * 0.08);
  const canvas = maxSide + pad * 2;

  // Contain into transparent square with small padding
  let squared = await sharp(inputPath, { animated: false, density: 300 })
    .ensureAlpha()
    .resize({
      width: canvas,
      height: canvas,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  // Header reverse marks: drop solid black plates so gold/color art remains
  squared = await knockOutNearBlack(squared);

  // Master 256px for future use
  await sharp(squared)
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(OUT, `${slug}.png`));

  for (const [name, px] of Object.entries(SIZES)) {
    await sharp(squared)
      .resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(OUT, name, `${slug}.png`));
  }
}

async function main() {
  await mkdir(RAW, { recursive: true });
  for (const name of Object.keys(SIZES)) {
    await mkdir(join(OUT, name), { recursive: true });
  }

  const report = [];
  for (const [slug, info] of Object.entries(SOURCES)) {
    process.stdout.write(`${slug}... `);
    try {
      const got = await downloadFirst(slug, info.url, ALTERNATES[slug] || []);
      await normalize(got.dest, slug);
      console.log(`ok (${got.bytes}b from ${got.url})`);
      report.push({
        slug,
        ok: true,
        downloadedFrom: got.url,
        officialSource: info.source,
        note: info.note || null,
      });
    } catch (e) {
      console.log(`FAIL ${e.message}`);
      report.push({
        slug,
        ok: false,
        error: e.message,
        officialSource: info.source,
        note: info.note || null,
      });
    }
  }

  await writeFile(join(OUT, "SOURCES.json"), JSON.stringify(report, null, 2));
  const failed = report.filter((r) => !r.ok);
  console.log(`\nDone. ${report.length - failed.length}/${report.length} ok.`);
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.slug).join(", "));
    process.exitCode = 1;
  }
}

main();
