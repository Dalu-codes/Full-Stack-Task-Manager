import { useState } from "react";
import type { View } from "./types";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import * as authApi from "./api/auth";
import { getToken, getStoredUsername } from "./api/client";

function App() {
  const existingToken = getToken();
  const existingUsername = getStoredUsername();

  const [view, setView] = useState<View>(existingToken && existingUsername ? "dashboard" : "login");
  const [username, setUsername] = useState<string>(existingUsername ?? "");
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  async function handleLogin(username: string, password: string) {
    await authApi.login({ username, password });
    setUsername(username);
    setIsFirstVisit(false);
    setView("dashboard");
  }

  async function handleSignup(username: string, password: string) {
    await authApi.signUp({ username, password });
    setUsername(username);
    setIsFirstVisit(true);
    setView("dashboard");
  }

  function handleLogout() {
    authApi.logout();
    setUsername("");
    setView("login");
  }

  if (view === "dashboard" && username) {
    return (
      <Dashboard
        userName={username}
        isFirstVisit={isFirstVisit}
        onLogout={handleLogout}
        onSessionExpired={handleLogout}
      />
    );
  }

  return (
    <AuthPage
      mode={view === "signup" ? "signup" : "login"}
      onSubmit={view === "signup" ? handleSignup : handleLogin}
      onSwitch={() => setView(view === "login" ? "signup" : "login")}
    />
  );
}

export default App;
