export interface ScanAction {
  step: number;
  timestamp: string;

  // Agent reasoning
  thinking: string | null;

  // Action details
  action: {
    name: string;
    params: string; // JSON stringified
    display: string;
  };

  // Browser context
  context: {
    url: string;
    title: string;
  };
}
