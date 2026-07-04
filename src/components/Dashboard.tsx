import { useEffect, useMemo, useState, useCallback } from "react";
import type { FilterTab, ModalMode, Task } from "../types";
import { statusOf } from "../types";
import { TaskCard } from "./TaskCard";
import { TaskModal, type TaskFormValues } from "./TaskModal";
import { ConfirmModal } from "./ConfirmModal";
import { WelcomeModal } from "./WelcomeModal";
import { PlusIcon, ChevronDownIcon } from "../icons/Icons";
import { PRIORITY_META } from "./priority";
import * as taskApi from "../api/tasks";
import { ApiError } from "../api/client";
import type { Priority } from "../types";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
];

interface DashboardProps {
  userName: string;
  isFirstVisit: boolean;
  onLogout: () => void;
  onSessionExpired: () => void;
}

export function Dashboard({ userName, isFirstVisit, onLogout, onSessionExpired }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(isFirstVisit);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await taskApi.getAllMyTasks();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
      setLoadError(err instanceof Error ? err.message : "Couldn't load your tasks.");
    } finally {
      setLoading(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
    }),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => statusOf(t) === filter);
  }, [tasks, filter]);

  function openAddModal() {
    setEditingTask(null);
    setSaveError(null);
    setModalMode("add");
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setSaveError(null);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingTask(null);
    setSaveError(null);
  }

  async function handleSave(data: TaskFormValues) {
    setSaving(true);
    setSaveError(null);
    try {
      if (modalMode === "edit" && editingTask) {
        const updated = await taskApi.updateTask({
          id: editingTask.id,
          completed: editingTask.completed,
          ...data,
        });
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await taskApi.createTask({ ...data, completed: false });
        setTasks((prev) => [...prev, created]);
      }
      closeModal();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
      setSaveError(err instanceof Error ? err.message : "Couldn't save this task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    setTogglingId(task.id);
    // optimistic update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      const updated = await taskApi.updateTask({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        completed: !task.completed,
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
    } finally {
      setTogglingId(null);
    }
  }

  function requestDelete(task: Task) {
    setTaskPendingDelete(task);
  }

  async function confirmDelete() {
    if (!taskPendingDelete) return;
    setDeleting(true);
    try {
      await taskApi.deleteTask(taskPendingDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskPendingDelete.id));
      setTaskPendingDelete(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
      // leave the confirm dialog open with the task if delete fails
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <header className="px-5 pt-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-[0.08em] text-muted">TODOTASK</span>
          <button
            type="button"
            onClick={() => setLogoutConfirmOpen(true)}
            className="focus-ring rounded text-xs font-medium text-muted transition-colors hover:text-teal"
          >
            Log out
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <h1 className="text-2xl font-bold text-ink sm:text-[28px]">Welcome {userName}!</h1>

          <button
            type="button"
            onClick={openAddModal}
            className="focus-ring order-3 flex h-11 items-center gap-2 rounded-lg bg-teal px-5 text-sm font-medium text-white transition-colors hover:bg-teal-dark active:scale-[0.98] sm:order-none"
          >
            <PlusIcon />
            Create Task
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-4">
          {/* Desktop tabs */}
          <div className="hidden items-center gap-2 sm:flex">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`focus-ring rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "border border-teal text-teal"
                    : "border border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab.label}({counts[tab.key]})
              </button>
            ))}
          </div>

          {/* Mobile filter dropdown */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMobileFilterOpen((v) => !v)}
              className="focus-ring flex items-center gap-1.5 rounded-md text-sm font-medium text-teal"
            >
              {TABS.find((t) => t.key === filter)?.label}({counts[filter]})
              <ChevronDownIcon className={`transition-transform ${mobileFilterOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileFilterOpen && (
              <div className="absolute left-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setFilter(tab.key);
                      setMobileFilterOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-cream ${
                      filter === tab.key ? "text-teal font-medium" : "text-ink"
                    }`}
                  >
                    {tab.label}({counts[tab.key]})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legend — dots indicate priority only */}
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1.5">
            {(Object.keys(PRIORITY_META) as Priority[]).map((key) => (
              <span key={key} className="flex items-center gap-1.5 text-xs text-ink">
                <span className={`h-2 w-2 rounded-full ${PRIORITY_META[key].dot}`} />
                {PRIORITY_META[key].label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="min-h-[60vh] bg-cream px-5 py-7 sm:px-8 lg:px-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-sm text-muted">Loading your tasks…</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-lg font-bold text-ink">Something went wrong</p>
            <p className="max-w-xs text-sm text-muted">{loadError}</p>
            <button
              type="button"
              onClick={loadTasks}
              className="focus-ring mt-2 rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-dark"
            >
              Try again
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-lg font-bold text-ink">No tasks here yet</p>
            <p className="max-w-xs text-sm text-muted">
              Tasks you create will show up here. Tap &quot;Create Task&quot; to add your first one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onToggle={toggleTask}
                onEdit={openEditModal}
                onDelete={requestDelete}
                busy={togglingId === task.id}
              />
            ))}
          </div>
        )}
      </main>

      {modalMode && (
        <TaskModal
          mode={modalMode}
          initialTask={editingTask}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
          error={saveError}
        />
      )}

      {taskPendingDelete && (
        <ConfirmModal
          title="Delete this task?"
          message={`"${taskPendingDelete.title}" will be removed for good. This can't be undone.`}
          confirmLabel={deleting ? "Deleting…" : "Delete task"}
          danger
          confirmDisabled={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setTaskPendingDelete(null)}
        />
      )}

      {logoutConfirmOpen && (
        <ConfirmModal
          title="Log out?"
          message="You'll need to sign back in to see your tasks."
          confirmLabel="Log out"
          danger
          onConfirm={() => {
            setLogoutConfirmOpen(false);
            onLogout();
          }}
          onCancel={() => setLogoutConfirmOpen(false)}
        />
      )}

      {showWelcome && <WelcomeModal userName={userName} onClose={() => setShowWelcome(false)} />}
    </div>
  );
}
