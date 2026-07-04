import { useEffect } from "react";

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

export function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="animate-overlay-in fixed inset-0 z-[70] flex items-center justify-center bg-ink/30 px-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="animate-modal-in w-full max-w-[380px] rounded-2xl bg-white p-7 text-center shadow-xl sm:p-8">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-2xl">
          👋
        </span>
        <h2 id="welcome-modal-title" className="mt-4 text-xl font-bold text-ink">
          Welcome, {userName}!
        </h2>
        <p className="mt-2 text-sm text-muted">
          Glad to have you here. Create your first task, set a priority and deadline, and TodoTask will keep it all
          organized for you.
        </p>

        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="focus-ring mt-7 h-11 w-full rounded-lg bg-teal text-sm font-medium text-white transition-colors hover:bg-teal-dark active:scale-[0.99]"
        >
          Let&apos;s get started
        </button>
      </div>
    </div>
  );
}
