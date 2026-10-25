import express from 'express';
import {
  generateDentalChatResponse,
  generateDentalSpeech,
  transcribeAudio,
  summarizeConversation,
  ChatMessage,
} from './geminiService';

export const apiApp = express();

apiApp.use(express.json({ limit: '15mb' }));

/**
 * Health check
 */
apiApp.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    clinic: 'Indian Dental Clinic',
    city: 'Chhindwara',
    geminiAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * Text Chat endpoint
 */
apiApp.post('/chat', async (req, res) => {
  try {
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
    return res.status(500).json({
      error: 'Failed to generate dental assistant response. Please try again.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * Voice Call Turn endpoint:
 */
apiApp.post('/voice/turn', async (req, res) => {
  try {
    const { userText, history = [], language = 'en', greetingOnly } = req.body;

    if (!userText || typeof userText !== 'string') {
      return res.status(400).json({ error: 'userText is required.' });
    }

    let replyText = '';
    if (greetingOnly) {
      replyText = userText;
    } else {
      const messages: ChatMessage[] = [
        ...history,
        { role: 'user', text: userText },
      ];
      replyText = await generateDentalChatResponse(messages, language);
    }

    const audioBase64 = await generateDentalSpeech(replyText, language);

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
apiApp.post('/voice/transcribe', async (req, res) => {
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
apiApp.post('/summary', async (req, res) => {
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

// Also export as apiRouter for server.ts
export const apiRouter = apiApp;
