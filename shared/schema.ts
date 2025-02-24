import { pgTable, text, serial, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Create enums for task priority
export const urgencyEnum = pgEnum("task_urgency", ["low", "medium", "high"]);
export const importanceEnum = pgEnum("task_importance", ["low", "medium", "high"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: serial("user_id"), 
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  listId: serial("list_id").notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  completed: boolean("completed").notNull().default(false),
  assignedTo: text("assigned_to"),
  urgency: urgencyEnum("urgency").default("medium"),
  importance: importanceEnum("importance").default("medium"),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// List schemas
export const insertListSchema = createInsertSchema(lists).pick({
  name: true,
  description: true,
});

// Task schemas
export const insertTaskSchema = createInsertSchema(tasks).pick({
  listId: true,
  description: true,
  notes: true,
  assignedTo: true,
  urgency: true,
  importance: true,
});

export const updateTaskSchema = z.object({
  completed: z.boolean().optional(),
  assignedTo: z.string().nullable().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  importance: z.enum(["low", "medium", "high"]).optional(),
}).strict();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;