import { registerAs } from '@nestjs/config';

export const lighthouseConfig = registerAs('lighthouse', () => ({
  chromePath: process.env.CHROME_PATH || undefined,
  chromeFlags: [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--no-first-run',
  ],
  numberOfRuns: parseInt(process.env.LIGHTHOUSE_RUNS || '1', 10),
  port: undefined,
}));
