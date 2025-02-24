import '../server/env.js';
import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";

const app = express();
app.use(express.json());

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Initialize routes
await registerRoutes(app);

// Serve static files in production
serveStatic(app);

export default app; 