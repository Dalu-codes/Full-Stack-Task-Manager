import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ModalMode, Priority, Task } from "../types";
import { CalendarIcon, ChevronDownIcon } from "../icons/Icons";
import { PRIORITY_OPTIONS } from "./priority";

export interface TaskFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // yyyy-mm-dd, matches backend LocalDate JSON
}

interface TaskModalProps {
  mode: Exclude<ModalMode, null>;
  initialTask: Task | null;
  onClose: () => void;
  onSave: (data: TaskFormValues) => void;
  saving?: boolean;
  error?: string | null;
}

export function TaskModal({ mode, initialTask, onClose, onSave, saving = false, error = null }: TaskModalProps) {
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [priority, setPriority] = useState<Priority | "">(initialTask?.priority ?? "");
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? "");
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !priority || !dueDate) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
    });
  }

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-modal-in flex max-h-[90vh] w-full max-w-[395px] flex-col overflow-y-auto rounded-2xl bg-white p-7 shadow-xl sm:max-w-[444px] sm:p-9">
        <h2 className="text-2xl font-bold text-ink">{isEdit ? "Edit Task" : "Add Task"}</h2>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col">
          <div className="flex flex-col gap-3.5">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task name"
              className="focus-ring h-[52px] w-full rounded-lg border border-line px-4 text-sm text-ink placeholder:text-muted transition-colors focus-visible:border-teal"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={1}
              className="focus-ring hidden h-[52px] w-full resize-none rounded-lg border border-line px-4 py-4 text-sm leading-tight text-ink placeholder:text-muted transition-colors focus-visible:border-teal lg:block"
            />

            <div className="relative">
              <select
                required
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="focus-ring h-[52px] w-full appearance-none rounded-lg border border-line bg-transparent px-4 pr-10 text-sm text-ink transition-colors focus-visible:border-teal"
              >
                <option value="" disabled>
                  Task priority level
                </option>
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            </div>

            <div className="relative">
              <input
                ref={dateInputRef}
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Set task deadline"
                className="focus-ring h-[52px] w-full rounded-lg border border-line px-4 pr-10 text-sm text-ink transition-colors [color-scheme:light] focus-visible:border-teal [&::-webkit-calendar-picker-indicator]:opacity-0"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => dateInputRef.current?.showPicker?.()}
                aria-label="Open calendar"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="flex-1 lg:min-h-12" />

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring h-12 flex-1 rounded-lg bg-line text-sm font-medium text-ink transition-colors hover:bg-line/70"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="focus-ring h-12 flex-1 rounded-lg bg-teal text-sm font-medium text-white transition-colors hover:bg-teal-dark active:scale-[0.99] disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Edit Task" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
