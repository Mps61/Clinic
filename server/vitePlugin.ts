import type { Plugin, ViteDevServer } from 'vite';
import { apiApp } from './api';
import { setupGeminiLiveWebSocket } from './geminiLiveBridge';

export function dentalApiPlugin(): Plugin {
  return {
    name: 'dental-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/api', (req: any, res: any, next: any) => {
        (apiApp as any)(req, res, next);
      });

      if (server.httpServer) {
        setupGeminiLiveWebSocket(server.httpServer as any);
      }
    },
  };
}
