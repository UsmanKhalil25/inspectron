export class StateManager {
    private visitedUrls: Set<string> = new Set();
    private urlQueue: Array<string> = [];


    private isVisited(url: string): boolean {
        return this.visitedUrls.has(url);
    }

    private isEnqueued(url: string): boolean {
        return this.urlQueue.includes(url)
    }

    addUrl(url: string): void {
        if (this.isVisited(url) || this.isEnqueued(url)) return
        this.urlQueue.push(url);
    }

    markVisited(url: string): void {
        this.visitedUrls.add(url);
    }

    getNextUrl(): string | undefined {
        return this.urlQueue.shift();
    }


    isEmpty(): boolean {
        return !this.urlQueue.length
    }

}

