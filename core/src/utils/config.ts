export function stringEnv(name: string, fallback?: string): string {
  const value = process.env[name];

  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function numberEnv(name: string, fallback?: number): number {
  const raw = process.env[name];

  if (raw === undefined || raw === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required numeric environment variable: ${name}`);
  }

  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return value;
}
