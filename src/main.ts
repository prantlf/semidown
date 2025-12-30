import { Semidown, MarkdownStreamChunker, HTMLRenderer } from "../lib/index";
import Chart from 'chart.js/auto';
import "./style.css";

class ChartChunker extends MarkdownStreamChunker {
  chartBlocks = new Map();

  protected emitUpdate(content: string, isComplete: boolean): void {
    super.emitUpdate(content, isComplete);
    // Remember fetched chart blocks for later re-rendering.
    if (isComplete && content.startsWith('```chart')) {
      this.chartBlocks.set(this.currentBlockId, content);
    }
  }
}

class ChartRenderer extends HTMLRenderer {
  private chartBlocks: Map<string, string>;

  constructor(targetElement: HTMLElement, chartBlocks: Map<string, string>) {
    super(targetElement);
    this.chartBlocks = chartBlocks;
  }

  async updateBlock(blockId: string, html: string, isComplete: boolean): Promise<void> {
    if (isComplete) {
      // Prefer rendering the chart as a picture to JSON data for the chart.
      const chartBlock = this.chartBlocks.get(blockId);
      if (chartBlock) {
        try {
          await this.renderChart(blockId, chartBlock);
          return;
        } catch (error: Error | any) {
          console.error('Error rendering chart:', error);
          const p = document.createElement('p');
          p.textContent = `Error rendering chart: ${error.message}`;
          html = p.outerHTML + html;
        }
      }
    }
    super.updateBlock(blockId, html, isComplete);
  }

  private async renderChart(blockId: string, chartBlock: string): Promise<void> {
    const chartText = chartBlock.slice(8, -3); // ```chart ... ```
    const chartData = JSON.parse(chartText);
    const container = this.blocks.get(blockId);
    const canvas = document.createElement('canvas');
    container!.innerHTML = '';
    container!.appendChild(canvas);
    new Chart(canvas, chartData);
  }
}

class DemoApp {
  private parser: Semidown | null = null;
  private streamingInterval: number | null = null;
  private currentText = "";
  private currentIndex = 0;
  private streamSpeed = 50; // ms between chunks
  private boundScrollToEnd = this.scrollToEnd.bind(this);

  private markdownInput: HTMLTextAreaElement;
  private targetElement: HTMLElement;
  private startBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private resumeBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private statusEl: HTMLElement;

  constructor() {
    this.markdownInput = document.getElementById("markdown-input") as HTMLTextAreaElement;
    this.targetElement = document.getElementById("output-container") as HTMLElement;
    this.startBtn = document.getElementById("start-btn") as HTMLButtonElement;
    this.pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;
    this.resumeBtn = document.getElementById("resume-btn") as HTMLButtonElement;
    this.stopBtn = document.getElementById("stop-btn") as HTMLButtonElement;
    this.statusEl = document.getElementById("status") as HTMLElement;

    this.setupEventListeners();
    this.loadSampleMarkdown();
  }

  private setupEventListeners(): void {
    this.startBtn.addEventListener("click", () => this.start());
    this.pauseBtn.addEventListener("click", () => this.pause());
    this.resumeBtn.addEventListener("click", () => this.resume());
    this.stopBtn.addEventListener("click", () => this.stop());
  }

  private loadSampleMarkdown(): void {
    const sampleMarkdown = `# Streaming Markdown Demo

This is a **demonstration** of the streaming markdown parser.

## Features

- Real-time markdown parsing
- Block-by-block rendering
- Pause and resume functionality

### Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## Lists

1. First item
2. Second item
3. Third item

- Bullet point one
- Bullet point two
- Bullet point three

### Quote

> This is a blockquote
> with multiple lines
> showing how the parser handles streaming content.

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| More     | Content  | Here     |

## Pictures

![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg)
![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg)
![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg)
![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg)
![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg) ![Vite](/semidown/vite.svg)

## Chart

\`\`\`chart
{
  "type": "doughnut",
  "data": {
    "labels": ["Italy", "France", "Spain", "USA", "Argentina"],
    "datasets": [{
      "backgroundColor": [
        "#b91d47",
        "#00aba9",
        "#2b5797",
        "#e8c3b9",
        "#1e7145"
      ],
      "data": [55, 49, 44, 24, 15]
    }]
  },
  "options": {
    "title": {
      "display": true,
      "text": "World Wide Wine Production 2018"
    }
  }
}
\`\`\`

---

**The End**

This demonstrates how the streaming parser handles various markdown elements as they arrive in chunks.`;

    this.markdownInput.value = sampleMarkdown;
  }

  private start(): void {
    if (this.parser) {
      this.parser.destroy();
    }

    this.currentText = this.markdownInput.value;
    this.currentIndex = 0;

    if (!this.currentText.trim()) {
      alert("Please enter some markdown text first!");
      return;
    }

    const chunker = new ChartChunker();
    const renderer = new ChartRenderer(this.targetElement, chunker.chartBlocks);
    this.parser = new Semidown({ chunker, renderer });

    this.updateStatus("Streaming...");
    this.updateButtons("streaming");

    this.startStreaming();
  }

  private pause(): void {
    this.parser!.pause();
    this.pauseStreaming();
    this.updateStatus("Paused");
    this.updateButtons("paused");
  }

  private resume(): void {
    this.parser!.resume();
    this.startStreaming();
    this.updateStatus("Streaming...");
    this.updateButtons("streaming");
  }

  private stop(): void {
    // Fast forward: send all remaining text at once
    if (this.currentIndex < this.currentText.length) {
      if (this.parser!.getState() === 'paused') {
        this.parser!.resume();
      }

      const remainingText = this.currentText.slice(this.currentIndex);
      this.parser!.write(remainingText);

      this.endStreaming();
      this.currentIndex = this.currentText.length;
    }

    // Stop the streaming interval
    this.pauseStreaming();

    // Update UI to complete state
    this.updateStatus("Complete");
    this.updateButtons("complete");
  }

  private scrollToEnd() {
    this.targetElement.scrollTo(0, this.targetElement.scrollHeight);
  }

  private startStreaming(): void {
    this.parser!.on('process-block', this.boundScrollToEnd);

    this.streamingInterval = window.setInterval(() => {
      if (this.currentIndex >= this.currentText.length) {
        // Finished streaming
        this.endStreaming();
        this.pauseStreaming();
        this.updateStatus("Complete");
        this.updateButtons("complete");
        return;
      }

      // Send a random chunk of text (1-10 characters)
      const chunkSize = Math.floor(Math.random() * 15) + 5; // Now returns integer 5-20
      const chunk = this.currentText.slice(this.currentIndex, this.currentIndex + chunkSize);

      this.parser!.write(chunk);

      this.currentIndex += chunk.length;
    }, this.streamSpeed);
  }

  private endStreaming(): void {
    const onProcessEnd = () => {
      this.parser!.off('process-block', this.boundScrollToEnd);
      this.parser!.off('process-end', onProcessEnd);
      this.scrollToEnd();
    };
    this.parser!.on('process-end', onProcessEnd);

    this.parser!.end();
  }

  private pauseStreaming(): void {
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
  }

  private updateStatus(status: string): void {
    this.statusEl.textContent = status;
  }

  private updateButtons(state: "streaming" | "paused" | "complete"): void {
    switch (state) {
      case "streaming":
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.resumeBtn.disabled = true;
        this.stopBtn.disabled = false;
        break;
      case "paused":
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = true;
        this.resumeBtn.disabled = false;
        this.stopBtn.disabled = false;
        break;
      case "complete":
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.resumeBtn.disabled = true;
        this.stopBtn.disabled = true;
        break;
    }
  }
}

// Initialize the demo when the page loads
new DemoApp();
