import { Marked } from "marked";
import markedShiki from "marked-shiki";
import { bundledLanguages, createHighlighter } from "shiki/bundle/web";
import { MarkdownParserCore } from "./parser-core";

/**
 * Wraps marked.parse() .
 */
export class MarkdownParser extends MarkdownParserCore {
  private initPromise: Promise<void>;

  constructor() {
    const marked = new Marked();
    super({ marked });
    this.initPromise = this.initialize(marked);
  }

  private async initialize(marked: Marked): Promise<void> {
    const supportedLanguages = Object.keys(bundledLanguages);

    const highlighter = await createHighlighter({
      langs: supportedLanguages,
      themes: ["dark-plus"],
    });

    marked.use(
      markedShiki({
        highlight(code, lang, _props) {
          const highlightableLanguage = supportedLanguages.includes(lang) ? lang : "text";

          const highlightedHtml = highlighter.codeToHtml(code, {
            lang: highlightableLanguage,
            theme: "dark-plus",
          });

          return highlightedHtml;
        },
      })
    );
  }

  /**
   * Parse markdown → HTML.
   */
  async parse(markdown: string): Promise<{ html: string }> {
    await this.initPromise;
    return super.parse(markdown);
  }
}
