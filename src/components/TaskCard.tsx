import type { Task } from "../types";
import { statusOf } from "../types";
import { PRIORITY_META, STATUS_META } from "./priority";
import { EditIcon, TrashIcon } from "../icons/Icons";

interface TaskCardProps {
  task: Task;
  index: number;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  busy?: boolean;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return iso;
  return `${dd}/${mm}/${yyyy}`;
}

export function TaskCard({ task, index, onToggle, onEdit, onDelete, busy = false }: TaskCardProps) {
  const priorityMeta = PRIORITY_META[task.priority];
  const status = statusOf(task);
  const statusMeta = STATUS_META[status];
  const isCompleted = task.completed;

  return (
    <div
      className="animate-card-in flex flex-col rounded-xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${priorityMeta.dot}`} aria-hidden title={priorityMeta.label} />
          <span
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${statusMeta.border} ${statusMeta.bg} ${statusMeta.text}`}
          >
            {statusMeta.label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-pressed={isCompleted}
          aria-label={isCompleted ? "Mark as pending" : "Mark as completed"}
          className="focus-ring relative h-5 w-9 shrink-0 rounded-full border border-ink/70 transition-colors disabled:opacity-50"
        >
          <span
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-ink transition-all ${
              isCompleted ? "left-[18px]" : "left-[3px]"
            }`}
          />
        </button>
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{task.title}</h3>
      <p className="mt-1 text-sm text-muted">{task.description || "Task description"}</p>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
        <span className="text-xs text-muted">
          {isCompleted ? "Completed date: " : "Date to be completed: "}
          {formatDate(task.dueDate)}
        </span>
        <div className="flex items-center gap-3 text-ink">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            className="focus-ring rounded text-ink/80 transition-colors hover:text-teal"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            className="focus-ring rounded text-ink/80 transition-colors hover:text-danger"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
