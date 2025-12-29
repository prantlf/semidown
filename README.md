# Semidown

A semi-incremental streaming markdown parser and renderer for the web, designed for handling LLM streaming out.

[Try the live demo!](https://prantlf.github.io/semidown/)

This is a fork of the original project with the following enhancements:

* ESM, CJS and UMD exports, not minified and minified, including source maps
* Default exports load external dependencies (`marked`, `marked-shiki` and `shiki/bundle/web`)
* The `core` exports have no dependencies, neither external, nor bundled
* The `bundle` exports include the dependencies (`marked`, `marked-shiki` and `shiki/bundle/web`)
* Fixes rendering of fenced blocks with empty lines.
* Lets override and extend parser, chunker and renderer.

## Install

```bash
npm install @prantlf/semidown
```

## Usage

Below is a simplified usage example. See `src/main.ts` for a full-featured demo with UI controls.

```typescript
import { Semidown } from "@prantlf/semidown";

const outputContainer = document.getElementById("output");
const parser = new Semidown(outputContainer);

// Simulate streaming input
const markdown = "# Hello\nThis is a **streaming** demo.";
let idx = 0;
const interval = setInterval(() => {
  if (idx < markdown.length) {
    parser.write(markdown[idx++]);
  } else {
    parser.end();
    clearInterval(interval);
  }
}, 50);
parser.on('process-end', () => {
  console.log("markdown processing ended");
})
```

If you need to customise the `Marked` instance, or do not need `Shiki` for syntax highlighting, you can use the import `@prantlf/semidown/core` instead.

```typescript
import { SemidownCore, MarkdownParserCore } from "@prantlf/semidown/core";
import { Marked } from "marked";

const targetElement = document.getElementById("output");
const marked = new Marked();
const parser = new MarkdownParserCore({ marked });
const semidown = new SemidownCore({ targetElement, parser });
```

For full customisation, you can create instances of `chunker`, `parser` and `renderer` on your own.

```typescript
import {
  SemidownCore,
  MarkdownStreamChunker,
  MarkdownParserCore,
  HTMLRenderer
} from "@prantlf/semidown/core";
import { Marked } from "marked";

const targetElement = document.getElementById("output");
const chunker = new MarkdownStreamChunker({ blockIdPrefix: "blk-" });
const marked = new Marked();
const parser = new MarkdownParserCore({ marked });
const renderer = new HTMLRenderer({
  targetElement,
  datasetProperty: "mdBlkId",
  completeCssClass: "md-blk-complete"
});
const semidown = new SemidownCore({ chunker, parser, renderer });
```

## Installation

You can install an NPM package by your favourite package manager, for example:

    npm i @prantlf/semidown

Or refer to it at `unpkg` on a web page:

    https://unpkg.com/@prantlf/semidown@2.1.0/dist/...

And choose a file from the table below instead of the three dots.

## Exports

Exported files in the `dist` directory, replace the three dots with the path to the `dist` directory above:

| Distributed file   | Loading statement            | Format | Minified | Dependencies | Environment   |
|:-------------------|:-----------------------------|--------|----------|--------------|---------------|
| `index.cjs`        | `import '@prantlf/semidown'` |   EJS  |    no    |   external   |      node     |
| `index.js`         | `import '@prantlf/semidown'` |   EJS  |    no    |   external   | node, browser |
| `index.min.js`     | `import '.../index.min.js'`  |   EJS  |    yes   |   external   |    browser    |
| `index.umd.js`     | `<script src=".../index.umd.js">`     |  UMD  |  no  | external |    browser    |
| `index.umd.min.js` | `<script src=".../index.umd.min.js">` |  UMD  |  yes | external |    browser    |
| `index-core.cjs`    | `import '@prantlf/semidown/core'` | EJS |  no   |     none     |      node     |
| `index-core.js`     | `import '@prantlf/semidown/core'` | EJS |  no   |     none     | node, browser |
| `index-core.min.js` | `import '.../index-core.min.js'`  | EJS |  yes  |     none     |    browser    |
| `index-core.umd.js` | `<script src=".../index-core.umd.js">` | UMD | no |   none     |    browser    |
| `index-core.umd.min.js` | `<script src=".../index-core.umd.min.js">` | UMD | yes | none | browser    |
| `index-bundle.js`         | `import '.../index-bundle.js'`     | EJS | no  | bundled |    browser    |
| `index-bundle.min.js`     | `import '.../index-bundle.min.js'` | EJS | yes | bundled |    browser    |
| `index-bundle.umd.js`     | `<script src=".../index-bundle.umd.js">`     | UMD | no  | bundled | browser |
| `index-bundle.umd.min.js` | `<script src=".../index-bundle.umd.min.js">` | UMD | yes | bundled | browser |

UMD modules are named `semidown` for being imported as an AMD dependency or found in a global namespace as IIFE.

## Key Features

- **Semi-incremental Parsing:**
  - **Block-level incremental:** As new markdown text arrives (e.g., from a stream), the parser incrementally processes and renders new blocks (paragraphs, lists, code blocks, tables, etc.) without reprocessing the entire document.
  - **Inline-level re-rendering:** Within a block, inline elements (bold, italics, links, code spans, etc.) are re-rendered as the block's content grows. This design ensures robust and correct inline rendering, even as partial input arrives.
- **Streaming Support:** Feed markdown text in arbitrary chunks (e.g., as it arrives from a network or user input) and see the output update in real time.
- **Pause, Resume, and Fast-forward:** Control the streaming process for demos, testing, or user interaction.
- **Performance & Robustness:** The semi-incremental approach balances efficient updates with correct rendering, avoiding flicker or broken formatting as content streams in.

## How It Works

- The parser maintains state as new markdown text is written.
- When a complete block is detected, it is parsed and rendered immediately.
- If a block is incomplete (e.g., a code block or list is still being typed), it is held and re-parsed as more text arrives.
- Inline elements within a block are always re-parsed on each update to ensure correctness.

## Sample App

The included demo (`src/main.ts`) provides a UI to:

- Start, pause, resume, and stop streaming markdown input
- See real-time updates as markdown is parsed and rendered
- Experiment with different markdown features (lists, code, tables, etc.)

## Design Rationale

- **Why semi-incremental?**
  - Full incremental parsing at the inline level is complex and error-prone, especially with partial tokens and nested formatting.
  - By incrementally parsing at the block level and re-rendering inlines, the library achieves a robust balance: fast updates for new blocks, and correct inline formatting as content grows.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Lint and test your code.

## License

Copyright (c) 2022-2025 Chuanqisun Sun \
Copyright (C) 2025 Ferdinand Prantl

Licensed under the [MIT License].

[MIT License]: http://en.wikipedia.org/wiki/MIT_License
