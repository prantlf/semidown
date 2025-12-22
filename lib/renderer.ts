/**
 * Customize a HTMLRenderer instance.
 */
export interface HTMLRendererOptions {
  targetElement: HTMLElement
  datasetProperty?: string
  completeCssClass?: string
}

/**
 * Renders each block into its own <div data-block-id="..."> under targetElement.
 */
export class HTMLRenderer {
  private targetElement: HTMLElement;
  private datasetProperty: string;
  private completeCssClass: string;

  protected blocks = new Map<string, HTMLElement>();

  constructor(targetElementOrOptions: HTMLElement | HTMLRendererOptions) {
    let targetElement: HTMLElement | undefined;
    let datasetProperty: string | undefined;
    let completeCssClass: string | undefined;
    if (targetElementOrOptions instanceof HTMLElement) {
      targetElement = targetElementOrOptions;
    } else {
      ({ targetElement, datasetProperty, completeCssClass } = targetElementOrOptions);
    }
    this.targetElement = targetElement;
    this.targetElement.innerHTML = "";
    this.datasetProperty = datasetProperty ?? "blockId";
    this.completeCssClass = completeCssClass ?? "md-block-complete";
  }

  createBlock(blockId: string): void {
    const div = document.createElement("div");
    div.dataset[this.datasetProperty] = blockId;
    this.targetElement.appendChild(div);
    this.blocks.set(blockId, div);
  }

  updateBlock(blockId: string, html: string, _isComplete: boolean): void {
    const el = this.blocks.get(blockId);
    if (el) {
      el.innerHTML = html;
    }
  }

  finalizeBlock(blockId: string, isComplete: boolean): void {
    const el = this.blocks.get(blockId);
    if (el && isComplete) {
      el.classList.add(this.completeCssClass);
    }
  }

  clear(): void {
    this.targetElement.innerHTML = "";
    this.blocks.clear();
  }
}
