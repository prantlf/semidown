import type { Marked } from "marked";

/**
 * Customize a HTMLRenderer instance.
 */
export interface MarkdownParserCoreOptions {
  marked: Marked
}

/**
 * Wraps marked.parse() and detects unclosed fenced-code blocks.
 */
export class MarkdownParserCore {
  private marked: Marked;

  constructor(options: MarkdownParserCoreOptions) {
    this.marked = options.marked;
  }

  /**
   * Parse markdown → HTML, and detect if there's an odd number
   * of ``` fences (i.e. an unclosed code block).
   */
  async parse(markdown: string): Promise<{ html: string; isComplete: boolean }> {
    const html = await this.marked.parse(markdown);
    const fences = (markdown.match(/```/g) || []).length;
    const isComplete = fences % 2 === 0;
    return { html, isComplete };
  }
}
