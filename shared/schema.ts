import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lists = pgTable("lists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  listId: serial("list_id").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  assignedTo: text("assigned_to"),
});

export const insertListSchema = createInsertSchema(lists).pick({
  name: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  listId: true,
  description: true,
  assignedTo: true,
});

export const updateTaskSchema = z.object({
  completed: z.boolean(),
  assignedTo: z.string().optional(),
  description: z.string().optional(),
});

export type List = typeof lists.$inferSelect;
export type InsertList = z.infer<typeof insertListSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
