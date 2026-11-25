export interface ScanInput {
  gender: "women" | "men";
  consent: boolean;
}

export interface ScanResult {
  measurements: Record<string, number>;
  confidence: "High" | "Medium" | "Low";
  source: string;
}

export interface ScanProvider {
  name: string;
  supports(gender: "women" | "men"): boolean;
  start(input: ScanInput): Promise<ScanResult>;
}

export class ScanProviderPlaceholder implements ScanProvider {
  name = "Phone scan (not configured)";
  supports() {
    return true;
  }
  async start(): Promise<ScanResult> {
    throw new Error("No scan provider is configured. Connect a vendor implementation in src/lib/scan-provider.ts.");
  }
}
