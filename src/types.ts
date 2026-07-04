// Matches the Spring Boot backend's Task entity / TaskRequest DTO.
export type Priority = "HIGH" | "MEDIUM" | "LOW";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // LocalDate JSON, e.g. "2026-05-18"
  completed: boolean;
}

// Body sent to POST /api/tasks and PUT /api/tasks.
// NOTE: the backend's @PutMapping() has no path variable, so the request
// body must carry the id itself for updates. id is omitted on create.
export interface TaskRequest {
  id?: number;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  completed: boolean;
}

// Generic backend envelope. Confirmed shape: { StatusCode, message, data? }
// — note the capital "S" on StatusCode, and `data` is sometimes absent
// entirely (e.g. the signUp endpoint only returns { StatusCode, message }).
export interface ApiResponse<T> {
  StatusCode: number;
  message: string;
  data?: T;
}

// UI-only derived status (backend just has Task.completed: boolean).
export type TaskStatus = "completed" | "pending";

export function statusOf(task: Pick<Task, "completed">): TaskStatus {
  return task.completed ? "completed" : "pending";
}

export type View = "login" | "signup" | "dashboard";

export type ModalMode = "add" | "edit" | null;

export type FilterTab = "all" | "completed" | "pending";
