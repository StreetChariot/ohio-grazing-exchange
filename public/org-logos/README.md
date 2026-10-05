# Organization logos

Normalized official logos for partners and USDA-accredited certifiers.

| Size | Folder | CSS / `OrgMark` | Asset (2×) |
|------|--------|-----------------|------------|
| sm | `sm/` | 28px (`size="sm"`) | 56×56 |
| md | `md/` | 36px (`size="md"`, default) | 72×72 |
| lg | `lg/` | 64px (`size="lg"`) | 128×128 |
| master | `*.png` | future / print | 256×256 |

Regenerate from curated sources:

```bash
npm run logos:fetch
```

Sources and notes: `SOURCES.json`. Marks for **Stellar** and **Americert** (and “Other NOP certifier”) keep the text badge fallback until official artwork is available.

These trademarks belong to their owners; use is for affiliation identification on the exchange.
