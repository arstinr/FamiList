import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertListSchema, insertTaskSchema, updateTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lists routes
  app.get("/api/lists", async (req, res) => {
    const lists = await storage.getLists();
    res.json(lists);
  });

  app.post("/api/lists", async (req, res) => {
    const result = insertListSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid list data" });
    }
    const list = await storage.createList(result.data);
    res.json(list);
  });

  app.delete("/api/lists/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }
    await storage.deleteList(id);
    res.status(204).end();
  });

  // Tasks routes
  app.get("/api/lists/:id/tasks", async (req, res) => {
    const listId = parseInt(req.params.id);
    if (isNaN(listId)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }
    const tasks = await storage.getTasks(listId);
    res.json(tasks);
  });

  app.post("/api/lists/:id/tasks", async (req, res) => {
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

  app.patch("/api/tasks/:id", async (req, res) => {
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

  app.delete("/api/tasks/:id", async (req, res) => {
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
