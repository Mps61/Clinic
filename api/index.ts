import type { IncomingMessage, ServerResponse } from 'http';
import { apiApp } from '../server/api';

/**
 * Main Vercel Serverless Function entry point.
 * Dispatches all /api/* requests to Express apiApp.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return (apiApp as any)(req, res);
}
