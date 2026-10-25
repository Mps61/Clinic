import type { IncomingMessage, ServerResponse } from 'http';
import { transcribeAudio } from '../../server/geminiService';

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
    const { audioBase64, mimeType } = body;

    if (!audioBase64) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'audioBase64 is required.' }));
      return;
    }

    const transcript = await transcribeAudio(audioBase64, mimeType || 'audio/webm');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        transcript,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error: any) {
    console.error('Vercel API /api/voice/transcribe error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Failed to transcribe audio.',
        details: error?.message || String(error),
      })
    );
  }
}
