import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Helper to get active API key from any supported environment variable
export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

// Create server-side Gemini client per skill guidelines with dynamic key lookup
export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Dynamic proxy for backwards compatibility with imports like: import { ai } from './geminiService'
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    const client = getGeminiClient();
    const val = (client as any)[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
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
 * Generate fast chat response using gemini-flash-latest with token capping for near-instant latency
 */
export async function generateDentalChatResponse(
  messages: ChatMessage[],
  userLanguage?: 'en' | 'hi'
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured in environment variables.');
    return userLanguage === 'hi'
      ? 'नमस्ते! इंडियन डेंटल क्लीनिक में आपका स्वागत है (शॉप नं. 43, कॉम्प्लेक्स, जेल बगीचा रोड, रौथा वाड़ा, छिंदवाड़ा, म.प्र. 480001)। हमारे क्लीनिक में दांत दर्द, रूट कैनाल (RCT), दांतों की सफाई, तार/ब्रेसेस और कैपिंग की सुविधा उपलब्ध है। अपॉइंटमेंट बुक करने के लिए कृपया वेबसाइट पर "Book Appointment" फॉर्म भरें या क्लीनिक पर संपर्क करें।'
      : 'Welcome to Indian Dental Clinic (Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, MP 480001). We provide comprehensive dental care including Root Canal Treatment, Scaling, Tooth Fillings, Braces, and Extractions. To schedule your visit, please submit an appointment request on our website or visit our clinic.';
  }

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

  const client = getGeminiClient();
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
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
      console.warn(`Model ${model} attempt failed:`, err?.message || err);
      // Continue to next fallback model
    }
  }

  console.error('All Gemini model attempts failed:', lastError);
  return userLanguage === 'hi'
    ? 'नमस्ते! इंडियन डेंटल क्लीनिक में आपका स्वागत है (शॉप नं. 43, जेल बगीचा रोड, रौथा वाड़ा, छिंदवाड़ा)। हमारे क्लीनिक में दांत दर्द, रूट कैनाल, सफाई और अन्य सभी दंत उपचार उपलब्ध हैं। डॉक्टर से परामर्श या अपॉइंटमेंट के लिए कृपया वेबसाइट पर "Book Appointment" फॉर्म भरें।'
    : 'Welcome to Indian Dental Clinic (Shop No. 43, Complex, Jail Bagicha Road, Rautha Wada, Chhindwara, MP). We provide consultations, Root Canal Treatment, teeth cleaning, fillings, and braces. You can schedule an appointment using our online booking form.';
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
  try {
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error('Error generating speech with Gemini TTS:', error);
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
    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Audio,
      },
    };

    const response = await ai.models.generateContent({
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
    console.error('Error transcribing audio with gemini-3.5-transcribe:', error);
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
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return {
        summary: 'Dental clinic enquiry consultation recorded.',
        enquiryCategory: 'General Consultation',
        keyPoints: [
          'Inquired about dental clinic services in Chhindwara',
          'Discussed oral hygiene and treatment advice',
          'Requested appointment information',
        ],
      };
    }

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

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
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
  } catch (error) {
    console.error('Error summarizing conversation:', error);
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
}
