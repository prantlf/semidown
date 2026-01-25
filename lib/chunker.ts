import type { ChunkerEvent, ChunkerListener } from "./types";

/**
 * Customize a MarkdownStreamChunker instance.
 */
export interface MarkdownStreamChunkerOptions {
  blockIdPrefix?: string
  withholdIncompleteLinks?: boolean
}

/**
 * Splits a stream of markdown text into block sub‑streams,
 * emitting start/update/end events per block, based on blank lines.
 */
export class MarkdownStreamChunker {
  private withholdIncompleteLinks: boolean;
  private blockIdPrefix: string;
  private buffer = "";
  private nextBlockId = 1;
  private listeners: Record<ChunkerEvent, ChunkerListener[]> = {
    "block-start": [],
    "block-update": [],
    "block-end": [],
    "block-remains": [],
    end: [],
  };

  protected currentBlockId: string | null = null;

  constructor(options?: MarkdownStreamChunkerOptions) {
    this.blockIdPrefix = options?.blockIdPrefix ?? "block-";
    this.withholdIncompleteLinks = options?.withholdIncompleteLinks ?? false;
  }

  /**
   * Write a chunk of markdown text into the chunker.
   */
  write(chunk: string): void {
    let fencedData: string | null = null;
    let data = this.buffer + chunk;
    this.buffer = "";

    // 1) While there's a blank-line boundary, cut out a full block
    while (true) {
      const idx = data.indexOf("\n\n");
      if (idx === -1) break;

      const part = data.slice(0, idx);
      // const openingBracket = part.lastIndexOf('[');
      // const closingBracket = part.lastIndexOf(']');
      // if (openingBracket >= 0 && (closingBracket < 0 || closingBracket < openingBracket)) {
      //   if (openingBracket === 0) {
      //     break;
      //   }
      //   part = data.slice(0, openingBracket);
      //   data = data.slice(openingBracket);
      // } else {
      data = data.slice(idx + 2);
      // }

      // If inside a fenced block, emit an update together with all
      // previous blocks.
      if (fencedData !== null) {
        fencedData = fencedData + part + "\n\n";
      }

      // Consider a block complete only if no fenced block is open.
      const balancedFences = this.hasBalancedFences(part)
      const isComplete = balancedFences ? fencedData === null : fencedData !== null;

      this.emitUpdate(fencedData ?? part, isComplete);

      // Enter or leave a fenced block if unbalanced ticks are detected.
      if (!balancedFences) {
        if (fencedData === null) {
          fencedData = part + "\n\n";
        } else {
          fencedData = null;
        }
      }

      // Emit an end only if not inside a fenced block.
      if (fencedData === null) {
        this.emitEnd(isComplete);
      }
    }

    // 2) Whatever remains is the current block's ongoing content
    if (fencedData !== null) {
      data = fencedData + data;
    }
    if (data.length > 0) {
      this.buffer = data;
      const safeData = this.withholdIncompleteLinks ? this.getSafeData(data) : data;
      this.emitUpdate(safeData, false);
      this.emitRemains(data);
    }
  }

  private getSafeData(data: string): string {
    const openingBracket = data.lastIndexOf('[');
    if (openingBracket >= 0) {
      const closingBracket = data.lastIndexOf(']');
      if (closingBracket < 0 || closingBracket < openingBracket || closingBracket === data.length - 1) {
        return data.slice(0, openingBracket);
      }
      const openingParenthesis = data.lastIndexOf('(');
      if (openingParenthesis >= 0) {
        if (openingParenthesis - 1 === closingBracket) {
          const closingParenthesis = data.lastIndexOf(')');
          if (closingParenthesis < 0 || closingParenthesis < openingParenthesis) {
            return data.slice(0, openingBracket);
          }
        }
      }
    }
    return data;
  }

  /**
   * Signal end of the overall stream.
   * Flush any remaining block.
   */
  end(): void {
    if (this.buffer.length > 0) {
      const isComplete = this.hasBalancedFences(this.buffer);
      this.emitUpdate(this.buffer, isComplete);
      this.buffer = "";
      this.emitEnd(isComplete);
    }
    this.emit("end");
  }

  on(event: ChunkerEvent, fn: ChunkerListener): void {
    this.listeners[event].push(fn);
  }

  off(event: ChunkerEvent, fn: ChunkerListener): void {
    this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
  }

  private emit(event: ChunkerEvent, payload?: any): void {
    for (const fn of this.listeners[event]) {
      // @ts-ignore
      fn(payload);
    }
  }

  protected emitStart(): void {
    if (!this.currentBlockId) {
      this.currentBlockId = `${this.blockIdPrefix}${this.nextBlockId++}`;
      this.emit("block-start", { blockId: this.currentBlockId });
    }
  }

  protected emitUpdate(content: string, isComplete: boolean): void {
    this.emitStart();
    this.emit("block-update", { blockId: this.currentBlockId!, content, isComplete });
  }

  emitRemains(content: string): void {
    this.emit("block-remains", { blockId: this.currentBlockId, content });
  }

  protected emitEnd(isComplete: boolean): void {
    if (!this.currentBlockId) return;
    this.emit("block-end", { blockId: this.currentBlockId, isComplete });
    this.currentBlockId = null;
  }

  private hasBalancedFences(content: string): boolean {
    const fences = (content.match(/```/g) || []).length;
    return fences % 2 === 0;
  }
}
