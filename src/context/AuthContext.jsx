import { createContext, useState } from "react";
import * as authService from "../services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const isStudentPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "student";
    if (isStudentPreview) {
      return { firstName: "ანა", lastName: "აბაშიძე", role: "student" };
    }

    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function setSession(token, sessionUser) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  }

  async function login(email, password) {
    const { data } = await authService.login(email, password);
    return setSession(data.token, data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout, setSession }}>{children}</AuthContext.Provider>;
}
