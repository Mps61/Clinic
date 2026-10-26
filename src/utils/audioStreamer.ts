/**
 * PCM Audio Helper for Gemini Live API Real-Time Voice & Gemini TTS
 * Input: 16kHz 16-bit mono PCM
 * Output: 24kHz 16-bit mono PCM playback and WAV decoding with gapless scheduling
 */

export function float32ToInt16Base64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

export function base64ToInt16(base64: string): Int16Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer);
}

export class GaplessPCMPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private currentHtmlAudio: HTMLAudioElement | null = null;
  public onAudioLevel?: (level: number) => void;
  public isMuted: boolean = false;

  public init() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.nextStartTime = this.audioCtx.currentTime;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playChunk(base64Audio: string) {
    if (this.isMuted) return;
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    try {
      const int16 = base64ToInt16(base64Audio);
      if (int16.length === 0) return;

      const float32 = new Float32Array(int16.length);
      let sum = 0;
      for (let i = 0; i < int16.length; i++) {
        const val = int16[i] / 32768.0;
        float32[i] = val;
        sum += Math.abs(val);
      }

      if (this.onAudioLevel) {
        const avg = (sum / int16.length) * 100;
        this.onAudioLevel(avg);
      }

      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;
      const startTime = Math.max(now, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) this.activeSources.splice(index, 1);
      };
    } catch (err) {
      console.warn('Error playing raw PCM chunk:', err);
    }
  }

  /**
   * Play base64 WAV audio (returned by Gemini TTS)
   */
  public async playWav(base64Wav: string): Promise<void> {
    if (this.isMuted) return;
    this.interrupt();

    return new Promise<void>((resolve) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
        this.currentHtmlAudio = audio;

        // Drive visualizer simulation while playing
        let animId: number | null = null;
        const pulse = () => {
          if (!audio.paused && !audio.ended && this.onAudioLevel) {
            // Simulated speech waveform
            const simulatedLevel = 25 + Math.random() * 40;
            this.onAudioLevel(simulatedLevel);
            animId = window.requestAnimationFrame(pulse);
          } else if (this.onAudioLevel) {
            this.onAudioLevel(0);
          }
        };

        audio.onplay = () => {
          animId = window.requestAnimationFrame(pulse);
        };

        const cleanup = () => {
          if (animId) window.cancelAnimationFrame(animId);
          if (this.onAudioLevel) this.onAudioLevel(0);
          this.currentHtmlAudio = null;
          resolve();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        audio.play().catch((playErr) => {
          console.warn('HTMLAudio play failed:', playErr);
          cleanup();
        });
      } catch (err) {
        console.warn('Error initiating WAV playback:', err);
        resolve();
      }
    });
  }

  public interrupt() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {}
    }
    this.activeSources = [];

    if (this.currentHtmlAudio) {
      try {
        this.currentHtmlAudio.pause();
        this.currentHtmlAudio.currentTime = 0;
      } catch {}
      this.currentHtmlAudio = null;
    }

    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    if (this.onAudioLevel) {
      this.onAudioLevel(0);
    }
  }

  public close() {
    this.interrupt();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
    }
  }
}
