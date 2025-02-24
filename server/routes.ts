import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertListSchema, insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { setupAuth } from "./auth";

// Middleware to check if user is authenticated
function isAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
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

  app.post("/api/lists", isAuthenticated, async (req, res) => {
    const result = insertListSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid list data" });
    }
    const list = await storage.createList({
      ...result.data,
      userId: req.user!.id
    });
    res.json(list);
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

  const httpServer = createServer(app);
  return httpServer;
}