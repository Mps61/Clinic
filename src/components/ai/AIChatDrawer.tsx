import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  User,
  Bot,
  CheckCircle,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { createConversationRecord } from '../../firebase/firestoreService';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToVoice: () => void;
  onOpenAppointment: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  time: string;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  onSwitchToVoice,
  onOpenAppointment,
}) => {
  const { language, setLanguage } = useSettings();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Namaste! Welcome to Indian Dental Clinic. I’m the clinic’s virtual assistant. I can answer general questions about dental care, explain the clinic’s listed services, and help you request an appointment. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'What services are available?',
    'What happens during Root Canal Treatment (RCT)?',
    'How do I care for bleeding gums?',
    'Can I book an appointment?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
          language: language,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const errMsg = errJson?.details || errJson?.error || `Server responded with status ${response.status}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const botMsg: Message = {
        role: 'model',
        text: data.reply || 'I am here to assist with your dental questions. Please feel free to ask about our treatments or clinic timings.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        role: 'model',
        text: 'I apologize, but I encountered a temporary connection issue. Please feel free to ask again or contact Indian Dental Clinic (Shop No. 43, Rautha Wada, Chhindwara) directly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'model',
        text: 'Namaste! Welcome to Indian Dental Clinic. I’m the clinic’s virtual assistant. I can answer general questions about dental care, explain the clinic’s listed services, and help you request an appointment. How can I help you today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSavedSuccess(false);
    setSaveError(null);
  };

  const handleSaveConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setSaveError('Please grant consent to share your details with clinic staff.');
      return;
    }
    if (!mobileNumber || mobileNumber.length < 10) {
      setSaveError('Please provide a valid 10-digit mobile number for staff callback.');
      return;
    }

    setSavingRecord(true);
    setSaveError(null);

    const fullTranscript = messages
      .map((m) => `${m.role === 'user' ? 'Patient' : 'AI Assistant'}: ${m.text}`)
      .join('\n\n');

    try {
      // Generate summary through server
      let summary = 'Patient consultation chat enquiry.';
      let enquiryCategory = 'General Dental';

      try {
        const sumRes = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: fullTranscript }),
        });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          summary = sumData.summary;
          enquiryCategory = sumData.enquiryCategory;
        }
      } catch (err) {
        console.warn('Could not generate automatic summary, continuing with raw transcript', err);
      }

      await createConversationRecord({
        sessionType: 'Chat',
        patientName: patientName.trim() || 'Website Visitor',
        mobileNumber: mobileNumber.trim(),
        transcript: fullTranscript,
        summary,
        enquiryCategory,
        consentGranted: true,
        consentVersion: 'v1.0-explicit-patient-consent',
        language: language,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setShowFollowUpModal(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to save conversation record:', err);
      setSaveError('Could not save conversation record. Please submit an appointment request through our booking form.');
    } finally {
      setSavingRecord(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-teal-800 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 border border-teal-500/50 flex items-center justify-center text-white">
              <Bot className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight font-heading">
                  AI Dental Assistant
                </h3>
                <span className="text-[10px] bg-teal-900/80 text-teal-200 px-1.5 py-0.5 rounded font-medium border border-teal-700">
                  Virtual Assistant
                </span>
              </div>
              <p className="text-xs text-teal-200">
                Indian Dental Clinic • Chhindwara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-xs font-semibold px-2 py-1 rounded bg-teal-900/60 text-teal-200 hover:text-white transition-colors"
              title="Toggle Hindi/English"
            >
              {language === 'en' ? 'हिन्दी' : 'EN'}
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-teal-200 hover:text-white transition-colors"
              title="New Conversation"
              aria-label="New Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-teal-200 hover:text-white transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voice switch bar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Prefer speaking out loud?</span>
          </div>
          <button
            onClick={() => {
              onClose();
              onSwitchToVoice();
            }}
            className="flex items-center gap-1 font-bold text-teal-700 hover:text-teal-900 bg-teal-100/60 px-2.5 py-1 rounded-md transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
            <span>Switch to Voice Call</span>
          </button>
        </div>

        {/* Quick Callback Notice */}
        <div className="px-4 py-1.5 bg-teal-50 border-b border-teal-100/80 flex items-center justify-between text-xs">
          <span className="text-teal-900 font-medium text-[11px]">
            Want clinic staff to call you back?
          </span>
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-teal-600" />
            <span>Request Callback</span>
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {/* Medical Disclaimer Banner */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Informational only: </span>
              This AI assistant provides general dental education and clinic information. It does not diagnose medical conditions or prescribe drugs. An in-person clinical examination is always required.
            </div>
          </div>

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                  <Bot className="w-4 h-4 text-teal-100" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-teal-700 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    m.role === 'user' ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-4 h-4 text-teal-100" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-slate-500 ml-1">Assistant is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="text-xs text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-slate-200 rounded-full px-3 py-1.5 whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Action / Follow-up triggers */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowFollowUpModal(true)}
            className="flex items-center gap-1.5 text-teal-700 font-semibold hover:underline"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Send this enquiry to clinic staff</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenAppointment();
            }}
            className="text-teal-800 font-bold hover:underline"
          >
            Book Appointment
          </button>
        </div>

        {/* Input area */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'दांतों से जुड़ा कोई भी सवाल पूछें...'
                  : 'Ask any question about dental care or clinic services...'
              }
              disabled={isLoading}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Send to Clinic Staff Consent Modal */}
        {showFollowUpModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-teal-800 font-bold text-base">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <h4>Send Enquiry to Clinic Staff</h4>
                </div>
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {savedSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-base mb-1">
                    Enquiry Forwarded Successfully!
                  </h5>
                  <p className="text-xs text-slate-600">
                    Your conversation summary has been securely transmitted to Indian Dental Clinic staff for follow-up.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSaveConversation} className="space-y-4 text-left">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If you would like clinic staff at Indian Dental Clinic to review your questions and contact you with appointment options, please provide your contact details below.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      maxLength={100}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number for Follow-up *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={15}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700 leading-relaxed">
                      <input
                        type="checkbox"
                        checked={consentGranted}
                        onChange={(e) => setConsentGranted(e.target.checked)}
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>
                        <strong>Explicit Consent:</strong> I consent to Indian Dental Clinic storing this conversation transcript and my mobile number to coordinate dental consultations and follow-up.
                      </span>
                    </label>
                  </div>

                  {saveError && (
                    <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {saveError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFollowUpModal(false)}
                      className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingRecord}
                      className="flex-1 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingRecord ? 'Submitting...' : 'Submit to Staff'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
