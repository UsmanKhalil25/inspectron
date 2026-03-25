import { registerAs } from '@nestjs/config';

export const browserAgentConfig = registerAs('browserAgent', () => ({
  apiUrl: process.env.BROWSER_AGENT_API_URL || 'http://localhost:2024',
}));
