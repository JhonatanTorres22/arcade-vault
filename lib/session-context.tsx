"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User {
  name: string;
}

interface SessionContextValue {
  user: User | null;
  login: (name: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("av_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }, []);

  const login = (name: string) => {
    const u: User = { name };
    setUser(u);
    try {
      localStorage.setItem("av_user", JSON.stringify(u));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("av_user");
    } catch {}
  };

  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <UserProvider>");
  return ctx;
}
