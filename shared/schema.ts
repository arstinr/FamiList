import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: serial("user_id"), 
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  listId: serial("list_id").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  assignedTo: text("assigned_to"),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// List schemas
export const insertListSchema = createInsertSchema(lists).pick({
  name: true,
});

// Task schemas
export const insertTaskSchema = createInsertSchema(tasks).pick({
  listId: true,
  description: true,
  assignedTo: true,
});

export const updateTaskSchema = z.object({
  completed: z.boolean().optional(),
  assignedTo: z.string().nullable().optional(),
  description: z.string().optional(),
}).strict();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;