import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { Modality, LiveServerMessage } from '@google/genai';
import { getGeminiClient, getGeminiApiKey, CLINIC_SYSTEM_INSTRUCTION } from './geminiService';

export function setupGeminiLiveWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/live' || url.pathname === '/api/live') {
        wss.handleUpgrade(request, socket, head, (clientWs) => {
          wss.emit('connection', clientWs, request);
        });
      }
      // Non-/live requests pass through to Vite HMR or other upgrade handlers without socket termination
    } catch {
      // Ignore URL parsing errors
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    let session: any = null;
    let isConnected = true;

    console.log('[Gemini Live] Client WebSocket connected for dental voice consultation');

    clientWs.on('close', () => {
      isConnected = false;
      console.log('[Gemini Live] Client WebSocket closed');
      if (session) {
        try {
          session.close();
        } catch (e) {
          console.warn('[Gemini Live] Notice on session close:', e);
        }
      }
    });

    clientWs.on('error', (err) => {
      console.error('[Gemini Live] Client WebSocket error:', err);
    });

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is missing on server.');
      }

      const client = getGeminiClient();

      // Connect to Gemini 3.8 Live API with voice configured as Kore (valid voice)
      session = await client.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
          systemInstruction: CLINIC_SYSTEM_INSTRUCTION,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            if (!isConnected || clientWs.readyState !== WebSocket.OPEN) return;

            // 1. Model Audio Output & Text
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  // Raw 24kHz 16-bit mono PCM audio chunk
                  clientWs.send(
                    JSON.stringify({
                      type: 'audio',
                      audio: part.inlineData.data,
                    })
                  );
                }
                if (part.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'text',
                      text: part.text,
                    })
                  );
                }
              }
            }

            // Output transcription from Gemini Live outputAudioTranscription
            const outputTrans = (message.serverContent as any)?.outputTranscription?.text;
            if (outputTrans && (!parts || parts.every((p: any) => !p.text))) {
              clientWs.send(
                JSON.stringify({
                  type: 'text',
                  text: outputTrans,
                })
              );
            }

            // User input speech transcription from Gemini Live inputAudioTranscription
            const interimUserText = (message.serverContent as any)?.interimInputTranscription?.text;
            if (interimUserText) {
              clientWs.send(
                JSON.stringify({
                  type: 'user_interim_text',
                  text: interimUserText,
                })
              );
            }

            const finalUserText = (message.serverContent as any)?.inputTranscription?.text;
            if (finalUserText) {
              clientWs.send(
                JSON.stringify({
                  type: 'user_final_text',
                  text: finalUserText,
                })
              );
            }

            // 2. Interruption signal
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // 3. Turn complete
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turn_complete' }));
            }
          },
          onerror: (error: any) => {
            console.error('[Gemini Live] Session error:', error?.message || error);
            if (isConnected && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  error: error?.message || 'Live API voice session error',
                })
              );
            }
          },
          onclose: () => {
            console.log('[Gemini Live] Live session closed');
            if (isConnected && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'closed' }));
            }
          },
        },
      });

      console.log('[Gemini Live] Session successfully connected with voice Kore');

      // Notify client that Gemini Live is connected and ready
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'ready' }));
      }

      // Handle incoming messages from browser client
      clientWs.on('message', (rawData) => {
        try {
          const msg = JSON.parse(rawData.toString());

          // Client streaming raw 16kHz PCM audio chunk from microphone
          if (msg.type === 'audio' && msg.audio && session) {
            session.sendRealtimeInput({
              audio: {
                data: msg.audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          }

          // Client sent text prompt / question
          if (msg.type === 'text' && msg.text && session) {
            session.sendRealtimeInput({
              text: msg.text,
            });
          }
        } catch (parseErr) {
          console.error('[Gemini Live] Error handling WebSocket message:', parseErr);
        }
      });
    } catch (connectError: any) {
      console.error('[Gemini Live] Failed to initialize session:', connectError?.message || connectError);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            error: connectError?.message || 'Failed to connect to real-time voice engine. Fallback active.',
          })
        );
      }
    }
  });

  return wss;
}
