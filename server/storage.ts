import { type List, type InsertList, type Task, type InsertTask, type UpdateTask } from "@shared/schema";

export interface IStorage {
  getLists(): Promise<List[]>;
  getList(id: number): Promise<List | undefined>;
  createList(list: InsertList): Promise<List>;
  deleteList(id: number): Promise<void>;
  
  getTasks(listId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private lists: Map<number, List>;
  private tasks: Map<number, Task>;
  private listId: number;
  private taskId: number;

  constructor() {
    this.lists = new Map();
    this.tasks = new Map();
    this.listId = 1;
    this.taskId = 1;
  }

  async getLists(): Promise<List[]> {
    return Array.from(this.lists.values());
  }

  async getList(id: number): Promise<List | undefined> {
    return this.lists.get(id);
  }

  async createList(insertList: InsertList): Promise<List> {
    const id = this.listId++;
    const list: List = { id, ...insertList };
    this.lists.set(id, list);
    return list;
  }

  async deleteList(id: number): Promise<void> {
    this.lists.delete(id);
    // Delete associated tasks
    const tasks = Array.from(this.tasks.values());
    for (const task of tasks) {
      if (task.listId === id) {
        this.tasks.delete(task.id);
      }
    }
  }

  async getTasks(listId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.listId === listId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task: Task = { id, completed: false, ...insertTask };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: UpdateTask): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    
    const updatedTask = { ...task, ...updateData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
