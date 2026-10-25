import type { IncomingMessage, ServerResponse } from 'http';
import { generateDentalChatResponse } from '../server/geminiService';

async function parseJsonBody(req: IncomingMessage & { body?: any }): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(
  req: IncomingMessage & { body?: any; method?: string },
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => any }
) {
  // Set CORS headers for Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { messages, language } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Messages array is required.' }));
      return;
    }

    const reply = await generateDentalChatResponse(messages, language);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        reply,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error: any) {
    console.error('Vercel API /api/chat error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Failed to process AI chat message.',
        details: error?.message || String(error),
      })
    );
  }
}
