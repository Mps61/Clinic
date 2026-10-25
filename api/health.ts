import type { IncomingMessage, ServerResponse } from 'http';
import { getGeminiApiKey } from '../server/geminiService';

export default function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const apiKey = getGeminiApiKey();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      status: 'healthy',
      clinic: 'Indian Dental Clinic',
      city: 'Chhindwara',
      geminiConfigured: Boolean(apiKey),
      deployment: 'vercel-ready',
      timestamp: new Date().toISOString(),
    })
  );
}
