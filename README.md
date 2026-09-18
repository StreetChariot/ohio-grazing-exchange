# Ohio Grazing Exchange

A two-sided match for grazing in Ohio. Landowners list pasture, cover crops, crop residue, or woodland. Livestock producers list the herd, how far they will travel, and when they need forage.

[Midwest Grazing Exchange](https://www.midwestgrazingexchange.com/) does this for Illinois, Indiana, Iowa, Michigan, Minnesota, Missouri, and Wisconsin. Ohio is not on that list. This app is the Ohio counterpart. It does not reuse their name, copy, or code.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:47281](http://127.0.0.1:47281).

Browse works immediately on ten fictional Ohio listings. Posting a listing writes `data/posted-listings.json` on this machine. That file is gitignored.

## Supabase

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Do not put the secret key in either variable. With those two set, browse and post use the `listings` table. Without them, the app stays on the local sample set.

Schema and sample rows are in `supabase/migrations`. A hosted project was not created: the organization is on the Pro plan, existing projects belong to other apps, and a new project is a paid monthly charge. Apply the migration only after that project exists. The intended compute size is Micro.

Anonymous clients can read and insert listings. They cannot update or delete. That matches this first slice, which has no accounts. Contact details are visible on the listing page.

## What you can do

- Home explains the two sides and the Ohio gap.
- Browse filters by listing side, Ohio county, livestock type, forage, season, and a date inside the available window.
- A schematic Ohio map plots the filtered pins.
- Listing detail shows forage, dates, fence, water, rate notes, and contact.
- Post a listing and it shows up in browse.
