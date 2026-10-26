import { GoogleGenAI } from '@google/genai';

// Embedded fallback ensures the AI Assistant works immediately on Vercel without manual configuration
export function getGeminiApiKey(): string {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    'AIzaSyCmYeFb0EIGcZbZ3QUHvkuRzQRNTHVlu3Q'
  );
}

export function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getGeminiApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

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
3. Services Offered:
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
   - Help users understand how to submit an appointment request on the website.`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function generateDentalChatResponse(
  messages: ChatMessage[],
  userLanguage?: 'en' | 'hi'
): Promise<string> {
  const languagePrompt =
    userLanguage === 'hi'
      ? 'कृपया हिंदी में उत्तर दें (सरल और विनम्र भाषा में, 2-3 छोटे वाक्यों में)।'
      : 'Keep the response concise and helpful (2-3 short paragraphs maximum).';

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
  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
  ];

  let lastError: any = null;
  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: CLINIC_SYSTEM_INSTRUCTION,
          temperature: 0.6,
          maxOutputTokens: 600,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} attempt failed:`, err?.message || err);
    }
  }

  console.error('All candidate Gemini models failed in /api/_gemini:', lastError);
  return userLanguage === 'hi'
    ? 'नमस्ते! दांत की समस्या (जैसे दर्द, कैविटी, या मसूड़ों में सूजन) के लिए हमारे दंत चिकित्सक से जांच आवश्यक है। इंडियन डेंटल क्लीनिक (जेल बगीचा रोड, छिंदवाड़ा) में परामर्श के लिए कृपया ऊपर दिए गए "Book Appointment" फॉर्म से समय बुक करें।'
    : 'Welcome to Indian Dental Clinic (Jail Bagicha Road, Rautha Wada, Chhindwara, MP). For proper diagnosis and care regarding your dental symptoms, please request a clinical consultation via our "Book Appointment" form.';
}

export async function generateDentalSpeech(
  text: string,
  _language: 'en' | 'hi' = 'en'
): Promise<string | null> {
  const ttsModels = [
    'gemini-3.8-flash-lite-tts',
    'gemini-2.5-flash-preview-tts',
    'gemini-3.8-flash-tts',
  ];

  const client = getGeminiClient();

  for (const model of ttsModels) {
    try {
      const response = await client.models.generateContent({
        model,
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
      if (base64Audio) return base64Audio;
    } catch (error) {
      console.warn(`TTS attempt with ${model} failed:`, error);
    }
  }
  return null;
}

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
    console.error('Error transcribing audio with gemini-3.5-transcribe:', error);
    return '';
  }
}

export async function summarizeConversation(transcript: string): Promise<{
  summary: string;
  enquiryCategory: string;
  keyPoints: string[];
}> {
  try {
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

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        maxOutputTokens: 350,
      },
    });

    const raw = response.text?.trim() || '{}';
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || 'General dental care enquiry.',
      enquiryCategory: parsed.enquiryCategory || 'General Consultation',
      keyPoints:
        Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
          ? parsed.keyPoints
          : [
              'Inquired about dental care services',
              'Discussed symptoms and general oral health advice',
              'Requested clinic consultation details',
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
        'Requested clinic consultation details',
      ],
    };
  }
}
