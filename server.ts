import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/api';
import { setupGeminiLiveWebSocket } from './server/geminiLiveBridge';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// API routes
app.use('/api', apiRouter);

// Serve static build assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const server = http.createServer(app);

// Attach Gemini Live real-time WebSocket server
setupGeminiLiveWebSocket(server);

server.listen(port, () => {
  console.log(`Indian Dental Clinic server running on port ${port} with Gemini Live real-time voice`);
});
