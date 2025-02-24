import { type List, type InsertList, type Task, type InsertTask, type UpdateTask, lists, tasks, users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // List operations
  getLists(): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;
  deleteList(id: number): Promise<void>;

  // Task operations
  getTasks(listId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // List operations
  async getLists(): Promise<List[]> {
    return await db.select().from(lists);
  }

  async getList(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list;
  }

  async createList(insertList: InsertList): Promise<List> {
    const [list] = await db.insert(lists).values(insertList).returning();
    return list;
  }

  async deleteList(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.listId, id));
    await db.delete(lists).where(eq(lists.id, id));
  }

  // Task operations
  async getTasks(listId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.listId, listId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values({ ...insertTask, completed: false }).returning();
    return task;
  }

  async updateTask(id: number, updateData: UpdateTask): Promise<Task> {
    const [task] = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    if (!task) throw new Error("Task not found");
    return task;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}

export const storage = new DatabaseStorage();