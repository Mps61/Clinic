import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { Modality, LiveServerMessage } from '@google/genai';
import { ai, CLINIC_SYSTEM_INSTRUCTION, switchClientToFallbackKey } from './geminiService';

export function setupGeminiLiveWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      if (url.pathname === '/live') {
        wss.handleUpgrade(request, socket, head, (clientWs) => {
          wss.emit('connection', clientWs, request);
        });
      }
      // Non-/live requests pass through to Vite HMR without socket termination
    } catch {
      // Ignore URL parsing errors
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    let session: any = null;
    let isConnected = true;

    clientWs.on('close', () => {
      isConnected = false;
      if (session) {
        try {
          session.close();
        } catch (e) {
          console.warn('Error closing Gemini Live session:', e);
        }
      }
    });

    clientWs.on('error', (err) => {
      console.error('Client WebSocket error in Gemini Live:', err);
    });

    try {
      const createSession = async () => {
        return await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Aoede' },
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

            // 2. Interruption signal (when user speaks over assistant)
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // 3. Turn complete
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turn_complete' }));
            }
          },
          onerror: (error: any) => {
            console.error('Gemini Live session error:', error);
            if (isConnected && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  error: error?.message || 'Live API session error',
                })
              );
            }
          },
          onclose: () => {
            if (isConnected && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'closed' }));
            }
          },
        },
      });
    };

    try {
      session = await createSession();
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('leaked') || errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')) {
        switchClientToFallbackKey();
        session = await createSession();
      } else {
        throw err;
      }
    }

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

          // Client sent text prompt / topic / question
          if (msg.type === 'text' && msg.text && session) {
            session.sendRealtimeInput({
              text: msg.text,
            });
          }
        } catch (parseErr) {
          console.error('Error handling WebSocket message:', parseErr);
        }
      });
    } catch (connectError) {
      console.error('Failed to initialize Gemini Live session:', connectError);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: 'error',
            error: 'Failed to connect to real-time voice engine. Fallback active.',
          })
        );
      }
    }
  });

  return wss;
}
