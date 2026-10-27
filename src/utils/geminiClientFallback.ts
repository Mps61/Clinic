import { GoogleGenAI } from '@google/genai';

/**
 * Checks for client-accessible Gemini API key (useful if configured as VITE_GEMINI_API_KEY in Vercel)
 */
export function getClientGeminiApiKey(): string {
  const key =
    (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ||
    (import.meta.env.GEMINI_API_KEY as string | undefined) ||
    '';
  return key.trim();
}

export function canUseClientGemini(): boolean {
  return Boolean(getClientGeminiApiKey());
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
 * Direct client-side Gemini fallback if Vercel serverless function is not reachable
 * or when VITE_GEMINI_API_KEY is configured directly on Vercel
 */
export async function generateDentalChatClientFallback(
  messages: ChatMessage[],
  userLanguage?: 'en' | 'hi'
): Promise<string> {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-client',
      },
    },
  });

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

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: contents,
    config: {
      systemInstruction: CLINIC_SYSTEM_INSTRUCTION,
      temperature: 0.6,
      maxOutputTokens: 300,
    },
  });

  return (
    response.text ||
    'I apologize, but I could not generate a response at this moment. Please try again.'
  );
}
