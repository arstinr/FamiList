import express, { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { Server } from "http";
import { createServer } from "http";
import { storage } from "./storage";
import { insertListSchema, insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { setupAuth } from "./auth";
import { db } from './db';
import { lists } from '@shared/schema';

// Middleware to check if user is authenticated
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Add this new route to get all users (without sensitive information)
  app.get("/api/users", isAuthenticated, async (req, res) => {
    const users = await storage.getUsers();
    // Only send necessary user information
    res.json(users.map(user => ({
      id: user.id,
      username: user.username
    })));
  });

  // Protected routes
  app.get("/api/lists", isAuthenticated, async (req, res) => {
    const lists = await storage.getLists();
    res.json(lists);
  });

  app.post("/api/lists", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const list = await db.insert(lists).values({
        name: req.body.name,
        description: req.body.description,
        userId: req.user?.id // assuming req.user exists from auth middleware
      });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create list' });
    }
  });

  app.delete("/api/lists/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }
    await storage.deleteList(id);
    res.status(204).end();
  });

  app.get("/api/lists/:id/tasks", isAuthenticated, async (req, res) => {
    const listId = parseInt(req.params.id);
    if (isNaN(listId)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }
    const tasks = await storage.getTasks(listId);
    res.json(tasks);
  });

  app.post("/api/lists/:id/tasks", isAuthenticated, async (req, res) => {
    const listId = parseInt(req.params.id);
    if (isNaN(listId)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }

    const result = insertTaskSchema.safeParse({ ...req.body, listId });
    if (!result.success) {
      return res.status(400).json({ error: "Invalid task data" });
    }

    const task = await storage.createTask(result.data);
    res.json(task);
  });

  app.patch("/api/lists/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }

    const result = insertListSchema.safeParse(req.body); //Potentially incorrect schema
    if (!result.success) {
      return res.status(400).json({ error: "Invalid list data" });
    }

    const list = await storage.updateList(id, result.data);
    res.json(list);
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const result = updateTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid update data" });
    }

    const task = await storage.updateTask(id, result.data);
    res.json(task);
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    await storage.deleteTask(id);
    res.status(204).end();
  });

  // Fix status property
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    const statusCode = (err as any).status || 500;
    res.status(statusCode).json({ message: err.message });
    next(err);
  });

  const httpServer = createServer(app);
  return httpServer;
}