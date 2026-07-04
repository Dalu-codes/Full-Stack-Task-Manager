import { apiRequest } from "./client";
import type { Task, TaskRequest, Priority } from "../types";

const BASE = "/tasks";

export function createTask(data: TaskRequest): Promise<Task> {
  return apiRequest<Task>(BASE, { method: "POST", body: data });
}

// Backend's @PutMapping() takes no path param — the id must be inside the body.
export function updateTask(data: TaskRequest & { id: number }): Promise<Task> {
  return apiRequest<Task>(BASE, { method: "PUT", body: data });
}

export function getAllMyTasks(): Promise<Task[]> {
  return apiRequest<Task[]>(BASE);
}

export function getTaskById(id: number): Promise<Task> {
  return apiRequest<Task>(`${BASE}/${id}`);
}

export function deleteTask(id: number): Promise<void> {
  return apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" });
}

export function getTasksByCompletedStatus(completed: boolean): Promise<Task[]> {
  return apiRequest<Task[]>(`${BASE}/status`, { query: { completed } });
}

export function getTasksByPriority(priority: Priority): Promise<Task[]> {
  return apiRequest<Task[]>(`${BASE}/priority`, { query: { priority } });
}
