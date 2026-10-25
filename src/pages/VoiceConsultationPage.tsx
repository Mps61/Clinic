import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Grid,
  MessageSquare,
  Lock,
  Info,
  Clock,
  Calendar,
  User,
  FileText,
  List,
  Check,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { ToothIcon } from '../components/icons/ToothIcon';
import { useSettings } from '../context/SettingsContext';
import { createConversationRecord } from '../firebase/firestoreService';
import { float32ToInt16Base64, GaplessPCMPlayer } from '../utils/audioStreamer';

interface VoiceConsultationPageProps {
  onBack: () => void;
  onNavigateToAppointment: (prefill?: { name?: string; phone?: string }) => void;
}

type CallState = 'pre-call' | 'active' | 'ended';

interface TranscriptTurn {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timeStr: string;
  seconds: number;
}

export const VoiceConsultationPage: React.FC<VoiceConsultationPageProps> = ({
  onBack,
  onNavigateToAppointment,
}) => {
  const { clinicInfo, language } = useSettings();

  // State Management
  const [callState, setCallState] = useState<CallState>('pre-call');

  // Pre-call Form inputs & validation
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [formTouched, setFormTouched] = useState(false);
  const [showConsentInfo, setShowConsentInfo] = useState(false);
  const [preCallError, setPreCallError] = useState<string | null>(null);

  // Active Call State
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'listening' | 'speaking' | 'processing' | 'idle'>('idle');
  const [currentSubtitle, setCurrentSubtitle] = useState<string>(
    'Hello! Welcome to Indian Dental Clinic. I\'m your virtual dental assistant. How may I help you today?'
  );
  const [transcripts, setTranscripts] = useState<TranscriptTurn[]>([]);
  const [showKeypadModal, setShowKeypadModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Call Ended State
  const [callEndedDuration, setCallEndedDuration] = useState('00:00');
  const [callEndedDate, setCallEndedDate] = useState('');
  const [summaryPoints, setSummaryPoints] = useState<string[]>([
    'Inquired about dental care services and clinic consultation',
    'Discussed oral hygiene and symptom care recommendations',
    'Requested clinic appointment and timing guidance',
  ]);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAllTranscripts, setShowAllTranscripts] = useState(false);

  // Hardware & Live WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<GaplessPCMPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const isCallActiveRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const lastAudioLevelUpdateRef = useRef<number>(0);
  const asstTextBufferRef = useRef<string>('');
  const speechRecogRef = useRef<any>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Validation
  const isNameValid = fullName.trim().length >= 2;
  const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
  const isMobileValid = /^[6-9]\d{9}$/.test(cleanMobile);
  const isFormValid = isNameValid && isMobileValid;

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keep isMutedRef synced
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Timer effect
  useEffect(() => {
    if (callState === 'active') {
      timerIntervalRef.current = window.setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [callState]);

  /**
   * Start Voice Call (Connects real-time Gemini Live WebSocket with voice Aoede)
   */
  const handleStartCall = async () => {
    setFormTouched(true);
    if (!isFormValid) {
      setPreCallError('Please provide your full name and a valid 10-digit Indian mobile number.');
      return;
    }
    setPreCallError(null);

    try {
      // 1. Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Initialize Gapless PCM Player (24kHz output for Gemini Live)
      const player = new GaplessPCMPlayer();
      player.init();
      player.onAudioLevel = (level) => {
        const now = Date.now();
        if (now - lastAudioLevelUpdateRef.current > 60) {
          lastAudioLevelUpdateRef.current = now;
          setAudioLevel(level);
        }
        setVoiceStatus((prev) => (prev === 'speaking' ? prev : 'speaking'));
      };
      playerRef.current = player;

      // 3. Connect to server-side Gemini Live WebSocket bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      isCallActiveRef.current = true;
      setCallSeconds(0);
      setCallState('active');

      const welcome = language === 'hi'
        ? 'नमस्ते! इंडियन डेंटल क्लीनिक में आपका स्वागत है। मैं आपकी वर्चुअल डेंटल असिस्टेंट हूँ। मैं आपकी क्या मदद कर सकती हूँ?'
        : 'Hello! Welcome to Indian Dental Clinic. I\'m your virtual dental assistant. How may I help you today?';

      const initialTurn: TranscriptTurn = {
        id: 'turn_0',
        speaker: 'assistant',
        text: welcome,
        timeStr: '00:00',
        seconds: 0,
      };
      setTranscripts([initialTurn]);
      setCurrentSubtitle(welcome);

      ws.onopen = () => {
        // Send initial greeting prompt so the Live model greets back immediately
        ws.send(JSON.stringify({
          type: 'text',
          text: `Greet the patient warmly: "${welcome}"`,
        }));
      };

      ws.onmessage = (event) => {
        if (!isCallActiveRef.current) return;
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'audio' && msg.audio) {
            // Live real-time audio chunk from Gemini Live (Aoede)
            if (!isSpeakerMuted) {
              playerRef.current?.playChunk(msg.audio);
            }
          }

          // User speaking transcription (from Gemini Live input audio transcription)
          if (msg.type === 'user_interim_text' && msg.text) {
            const clean = msg.text.trim();
            if (clean) {
              setCurrentSubtitle(clean);
              setVoiceStatus('listening');
            }
          }

          if (msg.type === 'user_final_text' && msg.text) {
            const clean = msg.text.trim();
            if (clean) {
              setCurrentSubtitle(clean);
              setVoiceStatus('processing');
              setTranscripts((prev) => [
                ...prev,
                {
                  id: `turn_${Date.now()}_u`,
                  speaker: 'user',
                  text: clean,
                  timeStr: formatTime(callSeconds),
                  seconds: callSeconds,
                },
              ]);
            }
          }

          // Assistant speaking transcription (from Gemini Live output audio transcription)
          if (msg.type === 'text' && msg.text) {
            asstTextBufferRef.current += msg.text;
            const fullText = asstTextBufferRef.current.trim();
            if (fullText) {
              setCurrentSubtitle(fullText);
              setVoiceStatus('speaking');
              setTranscripts((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.speaker === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, text: fullText }];
                } else {
                  return [
                    ...prev,
                    {
                      id: `turn_${Date.now()}_a`,
                      speaker: 'assistant',
                      text: fullText,
                      timeStr: formatTime(callSeconds),
                      seconds: callSeconds,
                    },
                  ];
                }
              });
            }
          }

          if (msg.type === 'interrupted') {
            playerRef.current?.interrupt();
            asstTextBufferRef.current = '';
            setVoiceStatus('listening');
          }

          if (msg.type === 'turn_complete') {
            asstTextBufferRef.current = '';
            setVoiceStatus('listening');
          }
        } catch (e) {
          console.error('Error handling live message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('Gemini Live WebSocket notice:', err);
      };

      ws.onclose = () => {
        console.log('Gemini Live WebSocket closed');
      };

      // 4. Setup AudioContext for continuous 16kHz PCM streaming (no mic cycling)
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      const micSource = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isCallActiveRef.current) return;

        // If user muted microphone in UI, don't stream audio and reset visualizer
        if (isMutedRef.current) {
          setAudioLevel(0);
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // Compute local mic audio level for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const level = (sum / inputData.length) * 100;
        const now = Date.now();
        if (now - lastAudioLevelUpdateRef.current > 60) {
          lastAudioLevelUpdateRef.current = now;
          setAudioLevel(level);
        }
        if (level > 2) {
          setVoiceStatus((prev) => (prev === 'speaking' ? prev : 'listening'));
        }

        // Stream raw PCM chunk to Gemini Live over WebSocket
        if (ws.readyState === WebSocket.OPEN) {
          const base64Audio = float32ToInt16Base64(inputData);
          ws.send(JSON.stringify({
            type: 'audio',
            audio: base64Audio,
          }));
        }
      };

      // Route processor to a silenced gain node to keep the pipeline alive without audio feedback
      const silenceGain = inputCtx.createGain();
      silenceGain.gain.value = 0;
      micSource.connect(processor);
      processor.connect(silenceGain);
      silenceGain.connect(inputCtx.destination);

      // 5. Start browser SpeechRecognition so patient voice is continuously recognized and answered
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        try {
          const recog = new SpeechRecognitionClass();
          recog.continuous = true;
          recog.interimResults = true;
          recog.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

          recog.onresult = (event: any) => {
            if (!isCallActiveRef.current || isMutedRef.current) return;
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                const finalSentence = event.results[i][0].transcript.trim();
                if (finalSentence) {
                  handleUserSpeechCompleted(finalSentence);
                }
              } else {
                interim += event.results[i][0].transcript;
              }
            }
            if (interim.trim()) {
              setCurrentSubtitle(interim.trim());
              setVoiceStatus('listening');
            }
          };

          recog.onerror = (e: any) => {
            console.warn('Speech recognition notice:', e?.error || e);
          };

          recog.onend = () => {
            if (isCallActiveRef.current && !isMutedRef.current) {
              try {
                recog.start();
              } catch {}
            }
          };

          recog.start();
          speechRecogRef.current = recog;
        } catch (e) {
          console.warn('Speech recognition startup notice:', e);
        }
      }

      setVoiceStatus('listening');

      // Speak welcome greeting immediately out loud
      playGreetingAudio(welcome);
    } catch (err) {
      console.error('Microphone error:', err);
      setPreCallError('Microphone permission is required to speak with our AI dental assistant. Please allow microphone access.');
    }
  };

  /**
   * Speak greeting audio out loud using TTS or browser SpeechSynthesis
   */
  const playGreetingAudio = async (greetingText: string) => {
    try {
      const res = await fetch('/api/voice/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: greetingText,
          language: language,
          greetingOnly: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64 && !isSpeakerMuted && isCallActiveRef.current) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          activeAudioElementRef.current = audio;
          setVoiceStatus('speaking');
          audio.onended = () => {
            if (isCallActiveRef.current) setVoiceStatus('listening');
          };
          audio.play().catch(() => {
            playSpeechSynthesisFallback(greetingText);
          });
          return;
        }
      }
    } catch {}
    if (isCallActiveRef.current && !isSpeakerMuted) {
      playSpeechSynthesisFallback(greetingText);
    }
  };

  /**
   * Browser SpeechSynthesis fallback if Gemini TTS audio is not playable
   */
  const playSpeechSynthesisFallback = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || isSpeakerMuted) {
      setTimeout(() => {
        if (isCallActiveRef.current) setVoiceStatus('listening');
      }, 2000);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utter.rate = 1.0;
      utter.onend = () => {
        if (isCallActiveRef.current) setVoiceStatus('listening');
      };
      utter.onerror = () => {
        if (isCallActiveRef.current) setVoiceStatus('listening');
      };
      setVoiceStatus('speaking');
      window.speechSynthesis.speak(utter);
    } catch {
      setTimeout(() => {
        if (isCallActiveRef.current) setVoiceStatus('listening');
      }, 2000);
    }
  };

  /**
   * Process user speech turn into transcript (from topic keypad or text input or SpeechRecognition)
   */
  const handleUserSpeechCompleted = (spokenSentence: string) => {
    if (!isCallActiveRef.current || !spokenSentence.trim()) return;

    const currentSecs = callSeconds;
    const userTurn: TranscriptTurn = {
      id: `turn_${Date.now()}_u`,
      speaker: 'user',
      text: spokenSentence.trim(),
      timeStr: formatTime(currentSecs),
      seconds: currentSecs,
    };

    setTranscripts((prev) => [...prev, userTurn]);
    setCurrentSubtitle(spokenSentence.trim());
    setVoiceStatus('processing');
    asstTextBufferRef.current = '';

    // Stop any currently playing audio so new reply takes over
    if (activeAudioElementRef.current) {
      try {
        activeAudioElementRef.current.pause();
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Send user prompt over WebSocket if connected, otherwise use HTTP endpoint
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: spokenSentence.trim(),
      }));
    } else {
      handleHttpVoiceFallback(spokenSentence.trim());
    }
  };

  const handleHttpVoiceFallback = async (spokenText: string) => {
    try {
      const historyContext = transcripts.slice(-4).map((t) => ({
        role: t.speaker === 'user' ? ('user' as const) : ('model' as const),
        text: t.text,
      }));

      const res = await fetch('/api/voice/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userText: spokenText,
          language: language,
          history: historyContext,
        }),
      });

      if (!res.ok) throw new Error('Voice API turn failed');

      const data = await res.json();
      const replyText = data.reply;
      const audioBase64 = data.audioBase64;

      setVoiceStatus('speaking');
      setCurrentSubtitle(replyText);

      const asstTurn: TranscriptTurn = {
        id: `turn_${Date.now()}_a`,
        speaker: 'assistant',
        text: replyText,
        timeStr: formatTime(callSeconds),
        seconds: callSeconds,
      };
      setTranscripts((prev) => [...prev, asstTurn]);

      if (audioBase64 && !isSpeakerMuted) {
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        activeAudioElementRef.current = audio;
        audio.onended = () => {
          if (isCallActiveRef.current) setVoiceStatus('listening');
        };
        audio.play().catch(() => {
          playSpeechSynthesisFallback(replyText);
        });
      } else if (!isSpeakerMuted) {
        playSpeechSynthesisFallback(replyText);
      } else {
        setTimeout(() => {
          if (isCallActiveRef.current) setVoiceStatus('listening');
        }, 2000);
      }
    } catch (e) {
      console.warn('HTTP fallback notice:', e);
      setVoiceStatus('listening');
    }
  };

  /**
   * End Voice Call
   */
  const handleEndCall = async () => {
    isCallActiveRef.current = false;

    // Stop speech recognition
    if (speechRecogRef.current) {
      try {
        speechRecogRef.current.stop();
      } catch {}
      speechRecogRef.current = null;
    }

    // Stop active audio
    if (activeAudioElementRef.current) {
      try {
        activeAudioElementRef.current.pause();
      } catch {}
      activeAudioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }

    // Stop player
    if (playerRef.current) {
      playerRef.current.close();
      playerRef.current = null;
    }

    // Stop mic audio context & stream
    if (processorNodeRef.current) {
      processorNodeRef.current.disconnect();
      processorNodeRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    const finalDurationStr = formatTime(callSeconds);
    setCallEndedDuration(finalDurationStr);
    const today = new Date();
    setCallEndedDate(
      today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    );

    setCallState('ended');

    // Always save patient consultation enquiry so clinic admin receives the details
    if (fullName.trim() && cleanMobile) {
      setIsSavingToDb(true);
      const fullTranscript = transcripts.length > 0
        ? transcripts
            .map((t) => `${t.speaker === 'user' ? fullName : 'Assistant'} (${t.timeStr}): ${t.text}`)
            .join('\n\n')
        : `Voice consultation connected with AI Dental Assistant. Duration: ${finalDurationStr}`;

      try {
        let summaryText = consentGranted
          ? `Voice consultation completed (${finalDurationStr}).`
          : `Voice consultation completed in Private Mode (${finalDurationStr}). Patient requested callback without storing conversation transcript.`;
        let category = 'Voice Consultation';
        let points = summaryPoints;

        if (consentGranted && transcripts.length > 0) {
          try {
            const sumRes = await fetch('/api/summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript: fullTranscript }),
            });
            if (sumRes.ok) {
              const sumData = await sumRes.json();
              summaryText = sumData.summary;
              category = sumData.enquiryCategory;
              if (Array.isArray(sumData.keyPoints) && sumData.keyPoints.length > 0) {
                points = sumData.keyPoints;
                setSummaryPoints(points);
              }
            }
          } catch (e) {
            console.warn('Summary generation notice:', e);
          }
        }

        await createConversationRecord({
          sessionType: 'Voice Call',
          patientName: fullName.trim(),
          mobileNumber: cleanMobile,
          transcript: consentGranted ? fullTranscript : '[Private Mode: Audio and transcript not retained per patient preference]',
          summary: summaryText,
          enquiryCategory: category,
          consentGranted: consentGranted,
          consentVersion: consentGranted ? 'v1.0-explicit-patient-consent' : 'v1.0-private-mode',
          callDuration: finalDurationStr,
          language: language,
        });

        setSavedSuccess(true);
      } catch (err) {
        console.error('Failed to save consultation record:', err);
        setSavedSuccess(false);
      } finally {
        setIsSavingToDb(false);
      }
    } else {
      setSavedSuccess(false);
    }
  };

  /**
   * Toggle Mute
   */
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (nextMuted) {
      setAudioLevel(0);
    }
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !nextMuted;
      });
    }
  };

  /**
   * Trigger WhatsApp conversation
   */
  const handleOpenWhatsApp = () => {
    const defaultNumber = clinicInfo.whatsappNumber ? clinicInfo.whatsappNumber.replace(/[^0-9]/g, '') : '919826000000';
    const msg = encodeURIComponent(`Hello Indian Dental Clinic, I just completed an AI Voice Consultation. My name is ${fullName || 'a patient'}. I would like to schedule a dental checkup.`);
    window.open(`https://wa.me/${defaultNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between select-none">
      {/* =========================================================================
          STATE 1: PRE-CALL FORM (Matches Left Screen in Mockup)
         ========================================================================= */}
      {callState === 'pre-call' && (
        <div className="max-w-xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 text-left">
          {/* Top Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="text-teal-600">
                <ToothIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight font-heading">
                  Indian Dental Clinic
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Chhindwara, Madhya Pradesh
                </p>
              </div>
            </div>
          </div>

          {/* Hero Banner Card with Smiling Healthcare Professional */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-50/90 via-teal-50/60 to-white border border-sky-100/90 p-5 sm:p-6 shadow-xs">
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-8 space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                  AI Voice Consultation
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Talk to our virtual assistant about dental care, clinic services and appointment enquiries.
                </p>
              </div>

              <div className="col-span-4 flex justify-end">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-teal-100/50">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80"
                    alt="Indian Dental Clinic Assistant"
                    className="w-full h-full object-cover object-top"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3 Feature Cards */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col items-center justify-start space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                Natural voice conversation in Hindi or English
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col items-center justify-start space-y-2">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                <ToothIcon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                Get answers about dental care, treatments and appointments
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-col items-center justify-start space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                Safe and private with your consent
              </p>
            </div>
          </div>

          {/* Error notice if validation fails */}
          {preCallError && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{preCallError}</span>
            </div>
          )}

          {/* Card: Your Details (Required) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                Your Details (Required)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Please provide your name and mobile number to start the voice call.
              </p>
            </div>

            {/* Field 1: Full Name */}
            <div className="relative">
              <div className="flex items-center bg-white border border-slate-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-teal-600 transition-all">
                <User className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    maxLength={80}
                    className="w-full text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 mt-0.5"
                  />
                </div>
              </div>
              {formTouched && !isNameValid && (
                <p className="text-[11px] text-red-500 mt-1 pl-2">Please enter your full name.</p>
              )}
            </div>

            {/* Field 2: Mobile Number */}
            <div className="relative">
              <div className="flex items-center bg-white border border-slate-300 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-600 focus-within:border-teal-600 transition-all">
                <Phone className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <div className="flex items-center gap-2 border-r border-slate-200 pr-3 mr-3">
                  <span className="text-base">🇮🇳</span>
                  <span className="text-xs font-bold text-slate-700">+91</span>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10 digit mobile number"
                    maxLength={10}
                    className="w-full text-sm font-semibold text-slate-900 bg-transparent focus:outline-none placeholder-slate-400 font-mono mt-0.5"
                  />
                </div>
              </div>
              {formTouched && !isMobileValid && (
                <p className="text-[11px] text-red-500 mt-1 pl-2">
                  Please enter a valid 10-digit Indian mobile number.
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-500 pl-1">
              We will use this number only for clinic follow-up if needed.
            </p>
          </div>

          {/* Card: Consent for Recording & Transcript (Optional) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
              Consent for Recording & Transcript (Optional)
            </h3>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-md text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed flex-1">
                I give consent to record and store the text transcript of this voice consultation and my contact information for clinic staff review and follow-up.
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowConsentInfo(!showConsentInfo);
                }}
                className="text-slate-400 hover:text-teal-600 p-0.5"
                title="View consent information"
              >
                <Info className="w-4 h-4" />
              </button>
            </label>

            {showConsentInfo && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                If consented, the conversation transcript and intake summary will be made available to Indian Dental Clinic dental surgeons to prepare for your consultation. You may request deletion anytime.
              </div>
            )}

            {/* Blue Info Box for Private Mode */}
            <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <p className="text-xs text-sky-900 leading-relaxed">
                If you do not agree, the call will run in <strong>Private Mode</strong>. No audio or transcript will be stored.
              </p>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleStartCall}
              disabled={!isFormValid}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md ${
                isFormValid
                  ? 'bg-[#00A389] hover:bg-[#008f77] text-white shadow-teal-900/20 active:scale-98'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>Start Voice Call</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>

            <p className="text-center text-[11px] text-slate-500">
              By continuing, you agree to our{' '}
              <a href="#privacy" className="text-teal-700 underline font-semibold">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-teal-700 underline font-semibold">
                Terms of Use
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: ACTIVE VOICE CALL (Matches Middle Screen in Mockup)
         ========================================================================= */}
      {callState === 'active' && (
        <div className="min-h-screen bg-[#040915] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden select-none">
          {/* Subtle background glow rings */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between max-w-xl mx-auto w-full">
            <button
              onClick={handleEndCall}
              className="p-2 -ml-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="End call and return"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="text-[#00C9B7]">
                <ToothIcon className="w-7 h-7" />
              </div>
              <div className="text-left">
                <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
                  Indian Dental Clinic
                </h2>
                <p className="text-[11px] text-slate-400">
                  Chhindwara, Madhya Pradesh
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowKeypadModal(true)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status Pill */}
          <div className="relative z-10 flex justify-center my-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0A261E] border border-emerald-800/80 text-[11px] font-bold text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connected</span>
            </div>
          </div>

          {/* Central Glowing Animated Dental Voice Orb */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulsing Glow Aura */}
              <div
                className="absolute rounded-full transition-transform duration-300 ease-out pointer-events-none"
                style={{
                  width: '280px',
                  height: '280px',
                  background: 'radial-gradient(circle, rgba(0, 242, 254, 0.35) 0%, rgba(79, 172, 254, 0.2) 45%, rgba(13, 148, 136, 0.08) 70%, transparent 85%)',
                  transform: `scale(${1 + Math.min(audioLevel / 160, 0.28)})`,
                  boxShadow: '0 0 80px rgba(0, 200, 255, 0.35)',
                }}
              />

              {/* Middle Rotating Liquid Halo Ring */}
              <div
                className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full blur-md opacity-80 animate-spin pointer-events-none"
                style={{
                  animationDuration: '14s',
                  background: 'conic-gradient(from 180deg at 50% 50%, #00f2fe 0deg, #4facfe 90deg, #00c9b7 180deg, #38ef7d 270deg, #00f2fe 360deg)',
                }}
              />

              {/* Inner Glowing Dental Orb Core */}
              <div
                className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-200"
                style={{
                  background: 'radial-gradient(circle at 40% 35%, #e0faff 0%, #00d2fe 40%, #0077b6 80%, #023e8a 100%)',
                  boxShadow: 'inset 0 0 25px rgba(255, 255, 255, 0.6), 0 0 50px rgba(0, 242, 254, 0.6)',
                  transform: voiceStatus === 'speaking' ? 'scale(1.06)' : 'scale(1.0)',
                }}
              >
                {/* White Tooth Silhouette in Center */}
                <div className="text-white drop-shadow-md">
                  <ToothIcon className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="mt-8 text-2xl sm:text-3xl font-extrabold tracking-wider font-mono text-white/95">
              {formatTime(callSeconds)}
            </div>

            {/* Live Audio Waveform Bars */}
            <div className="flex items-center justify-center gap-1.5 h-10 mt-3 px-4">
              {Array.from({ length: 28 }).map((_, i) => {
                const distFromCenter = Math.abs(i - 13.5) / 13.5;
                const baseFactor = Math.cos(distFromCenter * (Math.PI / 2));
                const dynamicHeight = Math.max(
                  6,
                  Math.min(
                    38,
                    baseFactor * (12 + (audioLevel > 5 ? (audioLevel / 5) * (1 + Math.sin(callSeconds * 4 + i)) : 6))
                  )
                );

                return (
                  <span
                    key={i}
                    className="w-1 rounded-full transition-all duration-75"
                    style={{
                      height: `${dynamicHeight}px`,
                      background: i % 2 === 0
                        ? 'linear-gradient(to top, #00f2fe, #4facfe)'
                        : 'linear-gradient(to top, #38ef7d, #00c9b7)',
                    }}
                  />
                );
              })}
            </div>

            {/* Status Pill */}
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1A30] border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  {voiceStatus === 'speaking'
                    ? 'Speaking...'
                    : voiceStatus === 'processing'
                    ? 'Thinking...'
                    : isMuted
                    ? 'Microphone Muted'
                    : 'Listening...'}
                </span>
              </div>
            </div>
          </div>

          {/* Subtitle / Dialogue Bubble */}
          <div className="relative z-10 max-w-lg mx-auto w-full my-3">
            <div className="flex items-start gap-2.5 bg-[#0A1629]/90 border border-slate-700/60 p-3.5 rounded-2xl shadow-lg backdrop-blur-md">
              <div className="w-8 h-8 rounded-full bg-[#00C9B7]/20 border border-[#00C9B7]/40 text-[#00C9B7] flex items-center justify-center shrink-0 mt-0.5">
                <ToothIcon className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3">
                {currentSubtitle}
              </p>
            </div>
          </div>

          {/* Bottom 5 Control Buttons */}
          <div className="relative z-10 max-w-md mx-auto w-full py-2">
            <div className="flex items-center justify-between px-2">
              {/* 1. Mute */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleToggleMute}
                  className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800/90 text-white hover:bg-slate-700 border border-slate-700/80'
                  }`}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <span className="text-[11px] text-slate-400 font-medium">Mute</span>
              </div>

              {/* 2. Speaker */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                  className={`w-13 h-13 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isSpeakerMuted
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800/90 text-white hover:bg-slate-700 border border-slate-700/80'
                  }`}
                  aria-label={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
                >
                  {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <span className="text-[11px] text-slate-400 font-medium">Speaker</span>
              </div>

              {/* 3. End Call (Prominent Red Button) */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-700/50 transition-all active:scale-95 cursor-pointer"
                  aria-label="End call"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-xs text-red-400 font-bold">End Call</span>
              </div>

              {/* 4. Keypad */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setShowKeypadModal(true)}
                  className="w-13 h-13 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Keypad options"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium">Keypad</span>
              </div>

              {/* 5. Chat */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={() => setShowChatModal(true)}
                  className="w-13 h-13 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="View live chat transcript"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium">Chat</span>
              </div>
            </div>
          </div>

          {/* Quick Keypad / Topics Sheet Modal */}
          {showKeypadModal && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowKeypadModal(false)}
            >
              <div
                className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Ask Dental Topic</h3>
                  <button onClick={() => setShowKeypadModal(false)} className="text-slate-400 hover:text-white text-xs">
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'What causes sudden tooth sensitivity?',
                    'Explain Root Canal Treatment (RCT)',
                    'How much time does teeth cleaning take?',
                    'Where is Indian Dental Clinic located?',
                    'I would like to book an appointment',
                  ].map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setShowKeypadModal(false);
                        handleUserSpeechCompleted(topic);
                      }}
                      className="p-3 text-left text-xs bg-slate-800 hover:bg-teal-900/60 rounded-xl text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live Chat Drawer Modal during Active Call */}
          {showChatModal && (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
              onClick={() => setShowChatModal(false)}
            >
              <div
                className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-5 space-y-3 text-left max-h-[75vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white">Live Conversation Transcript</h3>
                  <button onClick={() => setShowChatModal(false)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 py-2">
                  {transcripts.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        t.speaker === 'user'
                          ? 'bg-teal-700 text-white ml-6'
                          : 'bg-slate-800 text-slate-200 mr-6 border border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 mb-1">
                        {t.speaker === 'user' ? 'You' : 'Assistant'} • {t.timeStr}
                      </div>
                      <p>{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STATE 3: CALL-ENDED SCREEN (Matches Right Screen in Mockup)
         ========================================================================= */}
      {callState === 'ended' && (
        <div className="max-w-xl mx-auto w-full px-4 py-6 sm:py-8 space-y-6 text-left">
          {/* Top Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="text-teal-600">
                <ToothIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight font-heading">
                  Indian Dental Clinic
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Chhindwara, Madhya Pradesh
                </p>
              </div>
            </div>
          </div>

          {/* Success Checkmark & Call Ended Heading */}
          <div className="text-center space-y-2 pt-2">
            <div className="w-16 h-16 rounded-full bg-[#00C9B7] text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/25">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              Call Ended
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Thank you for speaking with us!
            </p>
          </div>

          {/* 3 Metric Cards in a row */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* 1. Duration */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400">Duration</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono truncate">
                  {callEndedDuration}
                </p>
              </div>
            </div>

            {/* 2. Date */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {callEndedDate || 'Today'}
                </p>
              </div>
            </div>

            {/* 3. Name */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400">Name</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {fullName || 'Patient'}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Conversation Status */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Conversation Status
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {consentGranted ? (
                  isSavingToDb ? (
                    'Saving your conversation record for clinic staff review...'
                  ) : savedSuccess ? (
                    'Your conversation has been saved as per your consent. Our clinic staff may review it and contact you if needed.'
                  ) : (
                    'Your conversation summary was processed. You can also request an appointment below.'
                  )
                ) : (
                  'Private Mode: No conversation transcript or audio was stored as per your selection.'
                )}
              </p>
            </div>
          </div>

          {/* Card: Conversation Summary */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <List className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Conversation Summary
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 pl-2">
              {summaryPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">•</span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card: Full Transcript */}
          {transcripts.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Full Transcript
                </h3>
                <button
                  onClick={() => setShowAllTranscripts(!showAllTranscripts)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  {showAllTranscripts ? 'Show Less' : 'View All'}
                </button>
              </div>

              <div className="space-y-4">
                {(showAllTranscripts ? transcripts : transcripts.slice(0, 3)).map((turn) => (
                  <div key={turn.id} className="flex items-start gap-3">
                    {turn.speaker === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                        <ToothIcon className="w-4 h-4" />
                      </div>
                    )}

                    <div className="space-y-0.5 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {turn.speaker === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {turn.timeStr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {turn.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => onNavigateToAppointment({ name: fullName, phone: cleanMobile })}
              className="py-3 px-4 rounded-2xl bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#1fb355] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
