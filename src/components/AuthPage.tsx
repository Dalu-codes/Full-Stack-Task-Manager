import { useState, type FormEvent } from "react";
import taskBriefImg from './undraw_task-brief_esbq 1.png';
import { Eye, EyeOff } from 'lucide-react';


interface AuthPageProps {
  mode: "login" | "signup";
  onSubmit: (username: string, password: string) => Promise<void>;
  onSwitch: () => void;
}

export function AuthPage({ mode, onSubmit, onSwitch }: AuthPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Form panel */}
      <div className="flex w-full flex-col px-6 pt-8 pb-10 sm:px-10 sm:pt-10 lg:w-1/2 lg:px-[7.6%] lg:pt-12 xl:px-28">
        <span className="text-xs tracking-[0.08em] text-muted">TODOTASK</span>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col lg:flex-none lg:mt-28"
        >
          <div className="mt-16 sm:mt-20 lg:mt-0">
            <h1 className="text-2xl font-bold text-ink sm:text-[28px]">
              {isLogin ? "Welcome back!" : "Create an account"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitch}
                    className="font-medium text-teal underline-offset-2 hover:underline focus-ring rounded"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitch}
                    className="font-medium text-teal underline-offset-2 hover:underline focus-ring rounded"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3.5">
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="focus-ring h-[52px] w-full rounded-lg border border-line px-4 text-sm text-ink placeholder:text-muted transition-colors focus-visible:border-teal"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="focus-ring h-[52px] w-full rounded-lg border border-line px-4 pr-11 text-sm text-ink placeholder:text-muted transition-colors focus-visible:border-teal"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="focus-ring absolute right-4 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <div className="flex-1" />

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring mt-10 h-[52px] w-full rounded-lg bg-yellow text-sm font-medium text-ink transition-colors hover:bg-yellow-hover active:scale-[0.99] disabled:opacity-60"
          >
            {submitting ? "Please wait for like 3 mins…" : isLogin ? "Log in" : "Sign up"}
          </button>
        </form>
      </div>

      {/* Illustration panel */}
      <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:p-4">
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-cream">
          <img src={taskBriefImg} alt="Task brief illustration" className="h-auto w-[55%] max-w-md" />
        </div>
      </div>
    </div>
  );
}