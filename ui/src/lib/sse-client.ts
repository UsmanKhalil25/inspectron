export class SSEClient {
  private eventSource: EventSource | null = null;
  private onMessageCallback: ((message: string) => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  constructor(url: string) {
    this.connect(url);
  }

  private connect(url: string) {
    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      if (this.onMessageCallback && event.data) {
        this.onMessageCallback(event.data);
      }
    };

    this.eventSource.onerror = (error) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };
  }

  onMessage(callback: (message: string) => void) {
    this.onMessageCallback = callback;
    return this;
  }

  onError(callback: (error: Event) => void) {
    this.onErrorCallback = callback;
    return this;
  }

  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

