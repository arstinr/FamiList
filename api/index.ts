import '../server/env.js';
import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";
import path from "path";

const app = express();
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'dist', 'public')));

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Initialize routes
await registerRoutes(app);

// Handle client-side routing
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return;
  res.sendFile(path.join(process.cwd(), 'dist', 'public', 'index.html'));
});

export default app; 