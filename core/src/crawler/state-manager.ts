export class StateManager {
  private visitedUrls: Set<string> = new Set();
  private urlQueue: Array<string> = [];

  private isVisited(url: string): boolean {
    return this.visitedUrls.has(url);
  }

  private isEnqueued(url: string): boolean {
    return this.urlQueue.includes(url);
  }

  addUrl(url: string): boolean {
    if (this.isVisited(url) || this.isEnqueued(url)) return false;
    this.urlQueue.push(url);
    return true;
  }

  markVisited(url: string): void {
    this.visitedUrls.add(url);
  }

  getNextUrl(): string | undefined {
    return this.urlQueue.shift();
  }

  isEmpty(): boolean {
    return !this.urlQueue.length;
  }

  getTotalDiscovered(): number {
    return this.visitedUrls.size + this.urlQueue.length;
  }

  getQueueDepth(): number {
    return this.urlQueue.length;
  }

  getVisitedCount(): number {
    return this.visitedUrls.size;
  }
}
