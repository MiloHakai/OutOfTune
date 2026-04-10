Palettes export

Files included:
- palettes.json — structured JSON export of the four palettes used by the site (day, sunset, indigo, night).
- palettes.css — quick CSS classes you can drop into a project to preview palettes by adding `.palette-day`, `.palette-sunset`, `.palette-indigo`, or `.palette-night` to the HTML element.
- swatches/*.svg — small SVG preview images showing SkyTop / SkyMid / SkyBottom / Accent / Text for each palette. These are vector and easy to convert to PNG if you want.

Usage:
- To preview in-browser, open `palettes.css` and add one of the `.palette-*` classes to the `<html>` element.
- To import colors into design tools, use `palettes.json` and map the values to your color variables.

Conversion tip:
- Convert SVGs to PNG with ImageMagick:

  magick convert swatches/day.svg swatches/day.png

Or open them in your design tool and export as needed.
