import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Detect and return a valid Gemini API key.
 * In AI Studio, the system injects process.env.GEMINI_API_KEY and process.env.VITE_GEMINI_API_KEY.
 * If one key was flagged as leaked/revoked (e.g. starting with AIzaSyCm or matching the leaked key),
 * we automatically fall back to the active valid key.
 */
export function getValidApiKey(): string {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const viteKey = process.env.VITE_GEMINI_API_KEY?.trim();

  const isInvalidOrLeaked = (k?: string): boolean => {
    if (!k) return true;
    if (k === 'MY_GEMINI_API_KEY') return true;
    // Specifically block the leaked key reported by Google's secret scanner
    if (k === 'AIzaSyCmYeFb0EIGcZbZ3QUHvkuRzQRNTHVlu3Q' || k.startsWith('AIzaSyCm')) {
      return true;
    }
    return false;
  };

  // If GEMINI_API_KEY is clean and not leaked, use it
  if (geminiKey && !isInvalidOrLeaked(geminiKey)) {
    return geminiKey;
  }
  // Otherwise use VITE_GEMINI_API_KEY
  if (viteKey && !isInvalidOrLeaked(viteKey)) {
    return viteKey;
  }
  return geminiKey || viteKey || '';
}

let cachedApiKey = getValidApiKey();
let currentClient = new GoogleGenAI({
  apiKey: cachedApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export function getAiClient(): GoogleGenAI {
  const validKey = getValidApiKey();
  if (validKey && validKey !== cachedApiKey) {
    cachedApiKey = validKey;
    currentClient = new GoogleGenAI({
      apiKey: cachedApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return currentClient;
}

export function switchClientToFallbackKey(): void {
  const viteKey = process.env.VITE_GEMINI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const nextKey = (cachedApiKey === geminiKey ? viteKey : geminiKey) || viteKey || geminiKey;
  if (nextKey && nextKey !== cachedApiKey) {
    cachedApiKey = nextKey;
    currentClient = new GoogleGenAI({
      apiKey: cachedApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
}

// Export ai proxy for backward compatibility with live session and existing imports
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getAiClient(), prop, receiver);
  },
});

export const CLINIC_SYSTEM_INSTRUCTION = `You are the virtual assistant for Indian Dental Clinic in Chhindwara, Madhya Pradesh, India.
You are an AI assistant, not a human or a dentist.
Be polite, calm, respectful, empathetic, and fast.
Respond in Hindi or English according to the user's language (or Hinglish if the user asks in Hinglish).
CRITICAL FOR SPEED & PATIENT EXPERIENCE: Keep your responses crisp, direct, and concise (under 80-120 words). Provide practical, immediate dental information without long introductory fluff or repetitive disclaimers.

Core Guidelines:
1. Address & Location:
   - Indian Dental Clinic is located at Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, Madhya Pradesh 480001, India.
   - Maps Share Link: https://share.google/BtqpneTy5qH1SZQnR
2. Contact details & Timings:
   - Phone and WhatsApp numbers and exact doctor degrees are currently undergoing verification by the clinic owner before official listing.
   - You can help users request an appointment directly through the website's appointment form.
3. Services Offered (Proposed catalogue):
   - Dental Consultations & Oral Examinations
   - Root Canal Treatment (RCT)
   - Tooth Fillings & Composite Restorations
   - Teeth Cleaning & Ultrasonic Scaling
   - Tooth Extractions & Wisdom Tooth Care
   - Orthodontic Consultation & Braces
   - Crowns & Fixed Bridges
   - Gum Care & Periodontal Maintenance
   - Dentures & Tooth Replacements
4. Medical Safety & Boundaries:
   - Answer general dental questions with cautious, evidence-informed information.
   - Never make a definitive diagnosis or prescribe medications/antibiotics/dosages.
   - Never guarantee treatment outcomes or invent prices.
   - Always explain that an in-person clinical examination by a qualified dentist is essential.
5. Emergencies:
   - For severe facial swelling, difficulty swallowing or breathing, uncontrolled oral bleeding, or major trauma, advise urgent immediate in-person emergency hospital care.
6. Appointments & Follow-up:
   - Help users understand how to submit an appointment request on the website.
   - If in a voice call or chat and the patient wants a callback, ask for their name and mobile number for clinic staff to schedule their consultation.
   - Never claim an appointment or record is confirmed unless the request has been submitted through the form or saved.`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Generate fast chat response using resilient models (gemini-3.1-flash-lite, gemini-3.8-flash, gemini-flash-latest)
 * with automatic API key fallback and token capping
 */
export async function generateDentalChatResponse(
  messages: ChatMessage[],
  userLanguage?: 'en' | 'hi'
): Promise<string> {
  const languagePrompt =
    userLanguage === 'hi'
      ? 'कृपया हिंदी में उत्तर दें (सरल और विनम्र भाषा में, 2-3 छोटे वाक्यों में)।'
      : 'Keep the response concise and helpful (2-3 short paragraphs maximum).';

  // Take the most recent 6 messages to keep context window tight and fast
  const recentMessages = messages.slice(-6);

  const contents = recentMessages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  if (languagePrompt && contents.length > 0) {
    const last = contents[contents.length - 1];
    if (last.role === 'user') {
      last.parts[0].text += `\n[System note: ${languagePrompt}]`;
    }
  }

  // Model fallback list: 'gemini-3.1-flash-lite' provides near-instant response and high reliability
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const client = getAiClient();
    for (const model of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: CLINIC_SYSTEM_INSTRUCTION,
            temperature: 0.6,
            maxOutputTokens: 300,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        if (errMsg.includes('leaked') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403')) {
          switchClientToFallbackKey();
          break; // Try next attempt with fallback key
        }
        // If 503 or model error, continue to next candidate model
      }
    }
  }

  throw lastError || new Error('Failed to generate dental assistant response');
}

/**
 * Generate Speech audio using gemini-3.8-flash-lite-tts
 * Configured with voice "Aoede" as specified
 * Returns base64 WAV audio
 */
export async function generateDentalSpeech(
  text: string,
  _language: 'en' | 'hi' = 'en'
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const client = getAiClient();
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: 'Calm, clear, and reassuring healthcare professional',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || null;
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes('leaked') || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
        switchClientToFallbackKey();
        continue;
      }
      console.error('Error generating speech with Gemini TTS:', error);
      return null;
    }
  }
  return null;
}

/**
 * Transcribe user audio bytes using gemini-3.5-transcribe
 */
export async function transcribeAudio(
  base64Audio: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const client = getAiClient();
      const audioPart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Audio,
        },
      };

      const response = await client.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            audioPart,
            {
              text: 'Transcribe this audio recording accurately. It may be in English or Hindi. Return only the exact transcription text.',
            },
          ],
        },
      });

      return response.text?.trim() || '';
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      if (errMsg.includes('leaked') || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
        switchClientToFallbackKey();
        continue;
      }
      console.error('Error transcribing audio with gemini-3.5-transcribe:', error);
      return '';
    }
  }
  return '';
}

/**
 * Generate concise summary and enquiry category from conversation transcript
 */
export async function summarizeConversation(transcript: string): Promise<{
  summary: string;
  enquiryCategory: string;
  keyPoints: string[];
}> {
  const prompt = `Analyze this dental clinic patient enquiry / conversation transcript:
"""
${transcript.slice(0, 8000)}
"""

Provide:
1. A concise 2-sentence clinical intake summary.
2. The primary enquiry category (e.g. Toothache / Pain, Root Canal Enquiry, Teeth Cleaning, Braces / Orthodontics, Extraction, Routine Checkup, General Dental Question, Appointment Request).
3. 3 to 4 concise bullet key points formatted as short phrases like "Asked about tooth pain and possible causes", "Inquired about root canal treatment", etc.

Return your response in this exact JSON format:
{
  "summary": "Concise summary here",
  "enquiryCategory": "Category here",
  "keyPoints": [
    "Point 1",
    "Point 2",
    "Point 3"
  ]
}`;

  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

  for (let attempt = 0; attempt < 2; attempt++) {
    const client = getAiClient();
    for (const model of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            maxOutputTokens: 250,
          },
        });

        const raw = response.text?.trim() || '{}';
        const parsed = JSON.parse(raw);
        return {
          summary: parsed.summary || 'General dental care enquiry.',
          enquiryCategory: parsed.enquiryCategory || 'General Consultation',
          keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
            ? parsed.keyPoints
            : [
                'Inquired about dental care services',
                'Discussed symptoms and general oral health advice',
                'Requested clinic consultation details'
              ],
        };
      } catch (error: any) {
        const errMsg = error?.message || String(error);
        if (errMsg.includes('leaked') || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
          switchClientToFallbackKey();
          break;
        }
      }
    }
  }

  return {
    summary: 'Patient conversation recorded with consent.',
    enquiryCategory: 'General Consultation',
    keyPoints: [
      'Inquired about dental care services',
      'Discussed symptoms and oral health advice',
      'Requested clinic consultation details'
    ],
  };
}
