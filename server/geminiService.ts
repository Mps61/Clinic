import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Safely resolve Gemini API Key from environment variables.
 * Supports GEMINI_API_KEY (primary), GOOGLE_API_KEY, and GOOGLE_GENAI_API_KEY (common Vercel names).
 */
export function getGeminiApiKey(): string | undefined {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY
  );
}

/**
 * Returns a configured GoogleGenAI instance.
 * Instantiated dynamically to ensure runtime environment variables on Vercel are read.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please add GEMINI_API_KEY to your Vercel project environment variables.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Export default instance for backward compatibility
export const ai = new GoogleGenAI({
  apiKey: getGeminiApiKey() || 'UNCONFIGURED_KEY',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
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
 * Generate dental chat response using gemini-3.8-flash with fallback to gemini-flash-latest
 */
export async function generateDentalChatResponse(
  messages: ChatMessage[],
  userLanguage?: 'en' | 'hi'
): Promise<string> {
  const client = getGeminiClient();

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

  // Multi-model resilience cascade:
  // 1. gemini-3.8-flash (primary)
  // 2. gemini-3.1-flash-lite (fast, high capacity pool)
  // 3. gemini-flash-latest
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const modelName of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: CLINIC_SYSTEM_INSTRUCTION,
          temperature: 0.6,
          maxOutputTokens: 300,
        },
      });

      if (response.text && response.text.trim()) {
        return response.text.trim();
      }
    } catch (modelErr: any) {
      console.warn(`[Gemini Chat] ${modelName} notice:`, modelErr?.message || modelErr);
      // Wait 300ms before trying the next model
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Graceful fallback response when upstream model demand is universally spiked
  return userLanguage === 'hi'
    ? 'नमस्ते! इंडियन डेंटल क्लिनिक, छिंदवाड़ा में आपका स्वागत है। हम रूट कैनाल, दांतों की सफाई, फिलिंग और ब्रेसेस की सुविधा प्रदान करते हैं। आप वेबसाइट पर अपॉइंटमेंट फॉर्म भरकर सीधे डॉक्टर से परामर्श प्राप्त कर सकते हैं।'
    : 'Namaste! Welcome to Indian Dental Clinic in Chhindwara. We are located at Shop No. 43, Jail Bagicha Road, Rautha Wada. We provide root canal treatment, ultrasonic teeth cleaning, composite fillings, and dental checkups. You can submit an appointment request directly using our booking form on this website.';
}

/**
 * Generate Speech audio using gemini-3.8-flash-lite-tts
 * Configured with voice "Kore" (reassuring, clear tone)
 * Returns base64 WAV audio (24kHz mono 16-bit WAV)
 */
export async function generateDentalSpeech(
  text: string,
  _language: 'en' | 'hi' = 'en'
): Promise<string | null> {
  try {
    const client = getGeminiClient();

    // Clean text to keep TTS smooth and natural
    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link on our website')
      .slice(0, 500);

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
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
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error('[Gemini Speech] Error generating speech with gemini-3.8-flash-lite-tts:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Transcribe user audio bytes using gemini-3.5-transcribe
 */
export async function transcribeAudio(
  base64Audio: string,
  mimeType: string = 'audio/webm'
): Promise<string> {
  try {
    const client = getGeminiClient();

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
  } catch (error) {
    console.error('[Gemini Transcribe] Error transcribing audio:', error instanceof Error ? error.message : error);
    return '';
  }
}

/**
 * Generate concise summary and enquiry category from conversation transcript
 */
export async function summarizeConversation(transcript: string): Promise<{
  summary: string;
  enquiryCategory: string;
  keyPoints: string[];
}> {
  try {
    const client = getGeminiClient();

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

    let raw = '{}';
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 250,
        },
      });
      raw = response.text?.trim() || '{}';
    } catch {
      // Fallback to gemini-3.1-flash-lite
      const response = await client.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          maxOutputTokens: 250,
        },
      });
      raw = response.text?.trim() || '{}';
    }
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || 'General dental care enquiry.',
      enquiryCategory: parsed.enquiryCategory || 'General Consultation',
      keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
        ? parsed.keyPoints
        : [
            'Inquired about dental care services',
            'Discussed symptoms and general oral health advice',
            'Requested clinic consultation details',
          ],
    };
  } catch (error) {
    console.error('[Gemini Summary] Error summarizing conversation:', error instanceof Error ? error.message : error);
    return {
      summary: 'Patient conversation recorded with consent.',
      enquiryCategory: 'General Consultation',
      keyPoints: [
        'Inquired about dental care services',
        'Discussed symptoms and oral health advice',
        'Requested clinic consultation details',
      ],
    };
  }
}
