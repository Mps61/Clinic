import type { IncomingMessage, ServerResponse } from 'http';
import {
  generateDentalChatResponse,
  generateDentalSpeech,
  ChatMessage,
} from '../../server/geminiService';

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
  res: ServerResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
    const { userText, history = [], language = 'en' } = body;

    if (!userText || typeof userText !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'userText is required.' }));
      return;
    }

    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', text: userText },
    ];

    const replyText = await generateDentalChatResponse(messages, language);
    const audioBase64 = await generateDentalSpeech(replyText, language);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        reply: replyText,
        audioBase64,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error: any) {
    console.error('Vercel API /api/voice/turn error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Failed to process voice turn.',
        details: error?.message || String(error),
      })
    );
  }
}
