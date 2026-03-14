import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('agent', () => ({
  apiUrl: process.env.AGENT_API_URL || 'http://localhost:2024',
}));
