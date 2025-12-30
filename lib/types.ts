/**
 * Chunker emits events: 'block-start', 'block-update', 'block-end', 'end'
 */
export type ChunkerEvent = "block-start" | "block-update" | "block-end" | "end";
export type ChunkerListener = ((p: BlockStartPayload) => void) | ((p: BlockUpdatePayload) => void) | ((p: BlockEndPayload) => void) | (() => void);

export interface BlockStartPayload {
  blockId: string;
}
export interface BlockUpdatePayload {
  blockId: string;
  content: string;
  isComplete: boolean;
}
export interface BlockEndPayload {
  blockId: string;
  isComplete: boolean;
}

/**
 * Semidown emits events: 'process-update', 'process-block', 'process-end'
 */
export type SemidownEvent = "process-update" | "process-block" | "process-end";
export type SemidownListener = (() => void);
