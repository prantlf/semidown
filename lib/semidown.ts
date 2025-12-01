import { SemidownCore } from "./semidown-core";
import type { SemidownCoreOptions } from "./semidown-core";
import { MarkdownStreamChunker } from "./chunker";
import { MarkdownParser } from "./parser";
import { HTMLRenderer } from "./renderer";

/**
 * Customize a Semidown instance.
 */
export interface SemidownOptions {
  targetElement?: HTMLElement,
  chunker?: MarkdownStreamChunker
  parser?: MarkdownParser
  renderer?: HTMLRenderer
}

/**
 * 4) Orchestrator: wires chunker → parser → renderer.
 *    Supports write(), end(), pause/resume, destroy().
 */
export class Semidown extends SemidownCore {
  constructor(targetElementOrOptions: HTMLElement | SemidownOptions) {
    if (targetElementOrOptions instanceof HTMLElement) {
      targetElementOrOptions = { targetElement: targetElementOrOptions };
    }
    if (!targetElementOrOptions.parser) {
      targetElementOrOptions.parser = new MarkdownParser();
    }
    super(targetElementOrOptions as SemidownCoreOptions);
  }
}
