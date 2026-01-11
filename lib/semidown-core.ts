import { MarkdownStreamChunker } from "./chunker";
import type { MarkdownParserCore } from "./parser-core";
import { HTMLRenderer } from "./renderer";
import type { BlockEndPayload, BlockStartPayload, BlockUpdatePayload, SemidownEvent, SemidownListener } from "./types";

/**
 * Customize a Semidown instance.
 */
export interface SemidownCoreOptions {
  targetElement?: HTMLElement,
  chunker?: MarkdownStreamChunker
  parser: MarkdownParserCore
  renderer?: HTMLRenderer
}

/**
 * 4) Orchestrator: wires chunker → parser → renderer.
 *    Supports write(), end(), pause/resume, destroy().
 */
export class SemidownCore {
  private chunker: MarkdownStreamChunker;
  private parser: MarkdownParserCore;
  private renderer: HTMLRenderer;
  private state: "idle" | "processing" | "paused" | "destroyed" = "idle";
  private blockStates = new Map();
  private listeners: Record<SemidownEvent, SemidownListener[]> = {
    "block-create": [],
    "block-update": [],
    "block-complete": [],
    "end": []
  };

  constructor(options: SemidownCoreOptions) {
    let targetElement: HTMLElement | undefined;
    let chunker: MarkdownStreamChunker | undefined;
    let parser: MarkdownParserCore;
    let renderer: HTMLRenderer | undefined;
    ({ targetElement, chunker, parser, renderer } = options);
    if (!(renderer || targetElement)) {
      throw new Error("Either targetElement or renderer must be provided.");
    }
    this.chunker = chunker ?? new MarkdownStreamChunker();
    this.parser = parser;
    this.renderer = renderer ?? new HTMLRenderer(targetElement as HTMLElement);
    this.hookup();
  }

  /** Feed more markdown text into the pipeline */
  write(chunk: string): void {
    if (this.state === "processing") {
      this.chunker.write(chunk);
    }
  }

  /** Signal no more data is coming */
  end(): void {
    if (this.state === "processing") {
      this.chunker.end();
    }
  }

  on(event: SemidownEvent, fn: SemidownListener): void {
    this.listeners[event].push(fn);
  }

  off(event: SemidownEvent, fn: SemidownListener): void {
    this.listeners[event] = this.listeners[event].filter((l) => l !== fn);
  }

  private emit(event: SemidownEvent, payload?: any): void {
    for (const fn of this.listeners[event]) {
      // @ts-ignore
      fn(payload);
    }
  }

  pause(): void {
    if (this.state === "processing") {
      this.state = "paused";
    }
  }

  resume(): void {
    if (this.state === "paused") {
      this.state = "processing";
    }
  }

  destroy(): void {
    this.state = "destroyed";
    this.renderer.clear();
    // tear down chunker listeners
    this.chunker.off("block-start", this.onBlockStart);
    this.chunker.off("block-update", this.onBlockUpdate);
    this.chunker.off("block-end", this.onBlockEnd);
    this.chunker.off("end", this.onEnd);
  }

  getState(): "idle" | "processing" | "paused" | "destroyed" {
    return this.state;
  }

  /** Wire chunker → parser → renderer */
  private hookup(): void {
    this.state = "processing";
    this.chunker.on("block-start", this.onBlockStart);
    this.chunker.on("block-update", this.onBlockUpdate);
    this.chunker.on("block-end", this.onBlockEnd);
    this.chunker.on("end", this.onEnd);
  }

  private onBlockStart = (p: BlockStartPayload) => {
    if (this.state !== "processing") return;
    this.renderer.createBlock(p.blockId);
    this.blockStates.set(p.blockId, { updateCounter: 0 });
    this.emit("block-create", p);
  };

  private onBlockUpdate = async (p: BlockUpdatePayload) => {
    if (this.state !== "processing") return;
    const blockState = this.blockStates.get(p.blockId);
    ++blockState.updateCounter;
    const { html } = await this.parser.parse(p.content);
    await this.renderer.updateBlock(p.blockId, html, p.isComplete);
    // we don't finalize here; wait for explicit block-end
    --blockState.updateCounter;
    this.emit("block-update", { ...p, html });
    if (p.isComplete) {
        // allow waiting for all blocks in the latest written chunk to finish
        if (blockState.ended && blockState.updateCounter === 0) {
            this.finishBlock(p);
        } else {
            blockState.complete = true;
        }
    } else if (blockState.updateCounter === 0) {
      // allow waiting for all blocks in the latest written chunk to finish
      if (blockState.ended && blockState.complete) {
          this.finishBlock(p);
      }
    }
  };

  private finishBlock(p: BlockEndPayload): void {
    this.emit("block-complete", p);
    this.blockStates.delete(p.blockId);
    // block-end and end events of the chunker are handled synchronously
    // and may finish earlier than block-update
    this.checkEnd();
  };

  private onBlockEnd = (p: BlockEndPayload) => {
    if (this.state !== "processing") return;
    this.renderer.finalizeBlock(p.blockId, p.isComplete);
    const blockState = this.blockStates.get(p.blockId);
    if (blockState.complete && blockState.updateCounter === 0) {
        this.finishBlock(p);
    } else {
        blockState.ended = true;
    }
  };

  private onEnd = () => {
    this.state = "idle";
    this.checkEnd();
  };

  private checkEnd() {
      if (this.state === "idle" && this.blockStates.size === 0) {
          this.emit("end");
    }
  }
}
