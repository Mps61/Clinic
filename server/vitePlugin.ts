import type { Plugin, ViteDevServer } from 'vite';
import { apiApp } from './api';

export function dentalApiPlugin(): Plugin {
  return {
    name: 'dental-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', (req: any, res: any, next: any) => {
        (apiApp as any)(req, res, next);
      });

      if (server.httpServer) {
        import('./geminiLiveBridge')
          .then(({ setupGeminiLiveWebSocket }) => {
            setupGeminiLiveWebSocket(server.httpServer as any);
          })
          .catch((err) => {
            console.warn('Notice loading Gemini Live WebSocket in dev server:', err);
          });
      }
    },
  };
}
