import type { Priority, TaskStatus } from "../types";

// Dots: indicate priority only. Red = high, light green = medium, yellow = low.
export const PRIORITY_META: Record<Priority, { label: string; dot: string }> = {
  HIGH: {
    label: "High priority",
    dot: "bg-danger",
  },
  MEDIUM: {
    label: "Medium priority",
    dot: "bg-light-green",
  },
  LOW: {
    label: "Low priority",
    dot: "bg-yellow",
  },
};

// Status pill: indicates status only. Completed = green, Pending = yellow.
export const STATUS_META: Record<TaskStatus, { label: string; text: string; border: string; bg: string }> = {
  completed: {
    label: "Completed",
    text: "text-leaf",
    border: "border-leaf/40",
    bg: "bg-leaf/10",
  },
  pending: {
    label: "Pending",
    text: "text-[#a3801a]",
    border: "border-yellow/60",
    bg: "bg-yellow/15",
  },
};

export const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
];
