/**
 * Chunker emits events: 'block-start', 'block-update', 'block-end', 'end'
 */
export type ChunkerEvent = "block-start" | "block-update" | "block-end" | "block-remains" | "end";
export type ChunkerListener = ((p: BlockStartPayload) => void) | ((p: BlockUpdatePayload) => void) | ((p: BlockRemainsPayload) => void) | ((p: BlockEndPayload) => void) | (() => void);

export interface BlockStartPayload {
  blockId: string;
}
export interface BlockUpdatePayload {
  blockId: string;
  content: string;
  isComplete: boolean;
}
export interface BlockUpdatePayload {
  blockId: string;
  content: string;
  isComplete: boolean;
}
export interface BlockRemainsPayload {
  blockId: string | null;
  content: string;
}
export interface BlockEndPayload {
  blockId: string;
  isComplete: boolean;
}

/**
 * Semidown emits events: 'block-create', 'block-update', 'block-complete', 'end'
 */
export type SemidownEvent = "block-create" | "block-update" | "block-complete" | "end";
export type SemidownListener = (() => void);
