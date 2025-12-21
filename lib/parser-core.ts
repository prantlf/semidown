import type { Marked } from "marked";

/**
 * Customize a HTMLRenderer instance.
 */
export interface MarkdownParserCoreOptions {
  marked: Marked
}

/**
 * Wraps marked.parse().
 */
export class MarkdownParserCore {
  private marked: Marked;

  constructor(options: MarkdownParserCoreOptions) {
    this.marked = options.marked;
  }

  /**
   * Parse markdown → HTML.
   */
  async parse(markdown: string): Promise<{ html: string }> {
    const html = await this.marked.parse(markdown);
    return { html };
  }
}
