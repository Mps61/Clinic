import express from 'express';
import {
  generateDentalChatResponse,
  generateDentalSpeech,
  transcribeAudio,
  summarizeConversation,
  getApiKey,
  ChatMessage,
} from './geminiService';

export const apiApp = express();

// CORS & Preflight headers for cross-origin or Vercel serverless invocations
apiApp.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

apiApp.use(express.json({ limit: '15mb' }));

const router = express.Router();

/**
 * Health check endpoint - reports API key status
 */
router.get('/health', (_req, res) => {
  const key = getApiKey();
  res.json({
    status: 'healthy',
    clinic: 'Indian Dental Clinic',
    city: 'Chhindwara',
    geminiAvailable: Boolean(key),
    keyConfigured: Boolean(key),
    keyPrefix: key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : null,
  });
});

/**
 * Text Chat endpoint
 */
router.post('/chat', async (req, res) => {
  try {
    const key = getApiKey();
    if (!key) {
      return res.status(500).json({
        error: 'Gemini API key is not configured.',
        details:
          'Please set GEMINI_API_KEY in your Vercel Project Settings > Environment Variables, then redeploy.',
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
  } catch (error) {
    console.error('Server /api/chat error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    const isKeyError =
      msg.includes('API_KEY') ||
      msg.includes('apiKey') ||
      msg.includes('API key') ||
      msg.includes('API_KEY_INVALID');

    return res.status(500).json({
      error: isKeyError
        ? 'Gemini API key is invalid or unauthorized. Please verify GEMINI_API_KEY in your Vercel Environment Variables.'
        : 'Failed to generate dental assistant response. Please try again.',
      details: msg,
      code: isKeyError ? 'INVALID_API_KEY' : 'GENERATION_ERROR',
    });
  }
});

/**
 * Voice Call Turn endpoint
 */
router.post('/voice/turn', async (req, res) => {
  try {
    const key = getApiKey();
    if (!key) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on server.',
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
    let audioBase64: string | null = null;
    try {
      audioBase64 = await generateDentalSpeech(replyText, language);
    } catch (ttsErr) {
      console.warn('TTS speech warning, falling back to text:', ttsErr);
    }

    return res.json({
      reply: replyText,
      audioBase64: audioBase64,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Server /api/voice/turn error:', error);
    return res.status(500).json({
      error: 'Failed to process voice turn.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Transcribe recorded audio snippet
 */
router.post('/voice/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required.' });
    }

    const transcript = await transcribeAudio(audioBase64, mimeType || 'audio/webm');
    return res.json({ transcript });
  } catch (error) {
    console.error('Server /api/voice/transcribe error:', error);
    return res.status(500).json({
      error: 'Failed to transcribe audio.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Summarize transcript for clinic staff intake
 */
router.post('/summary', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required.' });
    }

    const { summary, enquiryCategory, keyPoints } = await summarizeConversation(transcript);
    return res.json({ summary, enquiryCategory, keyPoints });
  } catch (error) {
    console.error('Server /api/summary error:', error);
    return res.status(500).json({
      error: 'Failed to summarize conversation.',
    });
  }
});

// Dual mount: handles both /api/... and bare /... routes for seamless Vercel serverless routing
apiApp.use('/api', router);
apiApp.use('/', router);

// Export router for server.ts and default export for Vercel
export const apiRouter = apiApp;
export default apiApp;
