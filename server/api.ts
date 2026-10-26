import express, { Request, Response, NextFunction } from 'express';
import {
  generateDentalChatResponse,
  generateDentalSpeech,
  transcribeAudio,
  summarizeConversation,
  getGeminiApiKey,
  ChatMessage,
} from './geminiService';

export const apiApp = express();

// Enable JSON body parsing with reasonable size limit
apiApp.use(express.json({ limit: '15mb' }));

// CORS headers & options handling
apiApp.use((_req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize request URL so routes match both with and without leading '/api'
// This fixes Vercel serverless rewrites vs Express router prefixing
apiApp.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4); // e.g. /api/chat -> /chat
  } else if (req.url === '/api') {
    req.url = '/';
  }
  next();
});

// Safe server-side request logging
apiApp.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const method = req.method;
  const path = req.path;

  res.on('finish', () => {
    const duration = Date.now() - start;
    // Safe logging: method, path, status code, duration (never log headers, body tokens, or secrets)
    console.log(`[API] ${method} ${path} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
});

/**
 * Health check endpoint:
 * Returns system readiness and whether GEMINI_API_KEY is configured on the server
 */
apiApp.get(['/', '/health'], (_req: Request, res: Response) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: 'healthy',
    clinic: 'Indian Dental Clinic',
    city: 'Chhindwara',
    state: 'Madhya Pradesh',
    geminiConfigured: Boolean(apiKey),
    voiceModel: 'gemini-3.8-flash-lite-tts (Kore)',
    liveModel: 'gemini-3.8-live (Kore)',
    chatModel: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Text Chat endpoint
 */
apiApp.post('/chat', async (req: Request, res: Response) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error('[API /chat] GEMINI_API_KEY environment variable is not configured on server.');
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your Vercel project Environment Variables.',
        code: 'MISSING_API_KEY',
      });
    }

    const { messages, language } = req.body as {
      messages: ChatMessage[];
      language?: 'en' | 'hi';
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const replyText = await generateDentalChatResponse(messages, language);

    return res.json({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const safeMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /chat] Error generating chat response:', safeMsg);
    
    return res.status(500).json({
      error: 'Failed to generate dental assistant response. Please try again.',
      details: safeMsg,
    });
  }
});

/**
 * Voice Call Turn endpoint:
 * Generates both text reply and high-fidelity speech audio (WAV) via Gemini TTS
 */
apiApp.post('/voice/turn', async (req: Request, res: Response) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.error('[API /voice/turn] GEMINI_API_KEY is not configured on server.');
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your Vercel project Environment Variables.',
        code: 'MISSING_API_KEY',
      });
    }

    const { userText, history = [], language = 'en' } = req.body;

    if (!userText || typeof userText !== 'string') {
      return res.status(400).json({ error: 'userText is required.' });
    }

    const messages: ChatMessage[] = [
      ...history,
      { role: 'user', text: userText },
    ];

    const replyText = await generateDentalChatResponse(messages, language);
    const audioBase64 = await generateDentalSpeech(replyText, language);

    return res.json({
      reply: replyText,
      audioBase64: audioBase64,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const safeMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /voice/turn] Error processing voice turn:', safeMsg);
    return res.status(500).json({
      error: 'Failed to process voice turn.',
      details: safeMsg,
    });
  }
});

/**
 * Transcribe recorded audio snippet
 */
apiApp.post('/voice/transcribe', async (req: Request, res: Response) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
    }

    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required.' });
    }

    const transcript = await transcribeAudio(audioBase64, mimeType || 'audio/webm');
    return res.json({ transcript });
  } catch (error: any) {
    const safeMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /voice/transcribe] Error transcribing audio:', safeMsg);
    return res.status(500).json({
      error: 'Failed to transcribe audio.',
      details: safeMsg,
    });
  }
});

/**
 * Summarize transcript for clinic staff intake
 */
apiApp.post('/summary', async (req: Request, res: Response) => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'MISSING_API_KEY',
      });
    }

    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required.' });
    }

    const { summary, enquiryCategory, keyPoints } = await summarizeConversation(transcript);
    return res.json({ summary, enquiryCategory, keyPoints });
  } catch (error: any) {
    const safeMsg = error instanceof Error ? error.message : String(error);
    console.error('[API /summary] Error summarizing conversation:', safeMsg);
    return res.status(500).json({
      error: 'Failed to summarize conversation.',
      details: safeMsg,
    });
  }
});

// Also export as apiRouter for server.ts
export const apiRouter = apiApp;
