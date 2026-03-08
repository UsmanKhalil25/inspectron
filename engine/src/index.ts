import { generateText } from 'ai';
import { Hono } from 'hono';

import { openai } from '@ai-sdk/openai';

const app = new Hono();

app.post('/', async (c) => {
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });

  return c.json({ text });
});

Bun.serve({
  port: 8081,
  idleTimeout: 60,
  fetch: app.fetch,
});
