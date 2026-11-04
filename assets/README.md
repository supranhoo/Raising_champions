# Approved brand artwork

These assets retain the actual vector path geometry from the supplied `optra360-zoptro-brand-expression-system-guidelines.pdf` (Update 7). They were converted from PDF drawing operations to SVG, without tracing, redrawing, reconstructing or substituting typography.

- `zoptro-wordmark-original.svg`: complete page 3 Zoptro Form XObject, including TM, in its source black. The PDF presentation applies 15% opacity around this Form; the source artwork itself is opaque black.
- `zoptro-wordmark-blue.svg` and `zoptro-wordmark-ivory.svg`: identical geometry, using primary palette colors Authority Blue `#09293D` and Clarity Ivory `#F4F2EA` from page 8.
- `zoptro-favicon.svg`: complete approved blue-circle / ivory-Z digital adaptation from page 4, with its original colors.
- `icon-*.svg`: the 16 approved functional icon geometries from page 31. Inline these SVGs to inherit CSS `currentColor`; set that foreground to an approved brand color with adequate contrast. The icon SVGs use a square viewBox and proportional scaling.

The full wordmarks include 72 source units of transparent clear space on every side, exceeding twice the P-stem width (approximately 35.47 units) required by page 5. Their viewBox is 824.0821 × 269.039. Render them at a total width of at least **122 CSS px**, so the visible complete wordmark remains at least **100 CSS px** wide as required by page 6. Keep the embedded clear space unoccupied; do not crop, stretch, or place text over it. At 190 CSS px total width, the visible wordmark is approximately 157 px wide and its protected footprint is approximately 62 px high.

The 200 × 200 favicon contains the complete 188-unit circular artwork and 6 units of transparent outer padding. This is an approved digital adaptation, not a letter cropped from the wordmark.

`brand-assets-provenance.json` records path counts, source bounds, colors and extraction provenance. Extraction script: `tmp/pdfs/asset-extract.py`. Visual QA contact sheet: `tmp/pdfs/asset-preview.png`.
