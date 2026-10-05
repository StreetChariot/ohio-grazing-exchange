# Ohio Grazing Exchange

A two-sided match for grazing in Ohio. Landowners list pasture, cover crops, crop residue, or woodland. Livestock producers list the herd, how far they will travel, and when they need forage.

[Midwest Grazing Exchange](https://www.midwestgrazingexchange.com/) does this for Illinois, Indiana, Iowa, Michigan, Minnesota, Missouri, and Wisconsin. Ohio is not on that list. This app is the Ohio counterpart. It does not reuse their name, copy, or code.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:47281](http://127.0.0.1:47281).

With the Supabase variables below set, browse and post use the hosted database. Without them, browse uses the ten sample listings in the repo and posts stay in gitignored `data/posted-listings.json`.

## Supabase

Hosted project `ohio-grazing-exchange` (ref `dxlasbqakpstfsxyrgvf`) in `us-east-2`:

https://dxlasbqakpstfsxyrgvf.supabase.co

The organization is on the Pro plan, which launches new projects on Micro compute (about $10/month). This project is separate from the other apps in that org. The listings migration, row level security, and ten sample rows are already applied.

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` to the project URL above
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the Supabase dashboard (publishable key, not the secret)

`.env.local` is gitignored. Do not commit keys. Without those two variables, the app stays on the local sample set and writes posts to `data/posted-listings.json`.

Anonymous clients can read listings. Contact details, posting, and listing
edits require a signed-in member. Hosts (admins) can remove any listing.

Create a member at `/sign-up`. The email `streetchariot@hotmail.com` is on the
host allowlist and becomes an admin on first sign-up. Other hosts can be added
in `public.admin_allowlist`.

## What you can do

- Home explains the two sides and the Ohio gap.
- Browse filters by listing side, Ohio county, livestock type, forage, season, and a date inside the available window.
- A schematic Ohio map plots the filtered pins.
- Listing detail shows forage, dates, fence, water, rate notes, and contact.
- Post a listing and it shows up in browse.
