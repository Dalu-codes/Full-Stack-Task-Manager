# Backend integration notes

The frontend talks to your Spring Boot API. Auth is confirmed against your
real `UserController`; the task side still has a couple of assumptions
flagged below.

## Resolved: sign-up "[object Object]" token bug

Your `signUp` endpoint's response is `{ StatusCode, message }` only — **no
token**. Registration and authentication are two separate steps on your
backend. The frontend now reflects that: `signUp()` registers the account,
then immediately calls `login()` with the same credentials to actually
obtain a session. `login()` also now throws a clear error instead of
silently storing a bad value if its response ever doesn't contain a token
string.

## Confirmed (from your `UserController`)

| Thing | Value |
|---|---|
| Auth base path | `/api/auth` |
| Signup endpoint | `POST /api/auth/signUp` — body `{ username, password }` |
| Login endpoint | `POST /api/auth/login` — body `{ username, password }` |
| Auth response | `Response<?>` envelope; the client unwraps `data` and treats it as the raw JWT |

The "Welcome back, {name}!" text on the dashboard now shows the `username`
directly (no more email-local-part guessing — turns out there's no email at
all).

## Still assumed (please double check these)

| Thing | Assumed |
|---|---|
| `Response<T>` JSON keys | `statusCode`, `message`, `data` (camelCase, from Lombok's generated getters). If your JSON actually comes back with a capital `StatusCode`, tell me and I'll adjust `ApiResponse` in `src/types.ts`. |
| `TaskRequest` body | `{ id?, title, description, priority, dueDate, completed }`. Your `@PutMapping()` on `/api/tasks` has no path variable, so update requests must carry `id` in the body — if your real `TaskRequest` doesn't have an `id` field, updates will fail with a validation error just like the login one did, and I'll need the real shape to fix it. |
| `priority` values | plain strings `"HIGH" \| "MEDIUM" \| "LOW"` |
| `dueDate` format | ISO `LocalDate`, e.g. `"2026-05-18"` — sent and received as-is |

If any task-related call fails with a validation error (same shape as the
`username` one you hit), paste it here the same way — that error message
tells us exactly which field is missing or misnamed.

## What you need to do on the backend

1. **Drop in CORS config.** `CorsConfig.java` is included at the top level of
   this zip. It belongs in the package `com.project.task_manager.config`, so
   put it at:
   ```
   src/main/java/com/project/task_manager/config/CorsConfig.java
   ```
   Without this the browser will block every request from the Vite dev server.

2. **Make sure Spring Security permits `/api/auth/**` without a token,** and
   that CORS runs ahead of your `AuthFilter`. Typically in your
   `SecurityConfig`:
   ```java
   .requestMatchers("/api/auth/**").permitAll()
   .anyRequest().authenticated()
   ```

3. **Run the backend on `localhost:8080`** (the default the frontend assumes).
   To point at a different host/port, copy `.env.example` to `.env` in the
   frontend project and set `VITE_API_BASE_URL`.

## What changed on the frontend

- `src/api/client.ts` — fetch wrapper: builds URLs against `VITE_API_BASE_URL`
  (default `http://localhost:8080/api`), attaches `Authorization: Bearer <token>`,
  unwraps the `Response<T>` envelope, clears the session + surfaces a friendly
  error on `401`s. Session is stored under `todotask.token` /
  `todotask.username` in `localStorage`.
- `src/api/auth.ts` — `signUp`, `login`, `logout`, hitting `/api/auth/signUp`
  and `/api/auth/login` with `{ username, password }`.
- `src/api/tasks.ts` — one function per `TaskController` endpoint: `createTask`,
  `updateTask`, `getAllMyTasks`, `getTaskById`, `deleteTask`,
  `getTasksByCompletedStatus`, `getTasksByPriority`.
- `src/types.ts` — `Task`/`TaskRequest` match your entity's real fields
  (`title`, `description`, `priority`, `dueDate`, `completed`, `id`).
- Refreshing the page keeps you signed in (token + username persisted).
  Logging out (with its confirmation modal) clears both.
- **First-visit welcome modal** only shows right after sign-up, not every
  login.
- Task creation/edit/delete/toggle all call the real endpoints, with loading
  and inline error states. The status toggle updates optimistically, then
  reverts if the `PUT` call fails.

## Testing it end to end

```bash
# backend (from your Spring project root)
./mvnw spring-boot:run     # or your usual run command — should come up on :8080

# frontend
cd todotask
npm install
npm run dev                # http://localhost:5173
```

Sign up with a new username, you should land on the dashboard with the
welcome modal, an empty task list, and a working "Create Task" flow end to end.
