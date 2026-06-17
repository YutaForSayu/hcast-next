"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { JWTPayload } from "@/lib/auth";

interface AuthContextType {
  user: JWTPayload | null;
  setUser: (user: JWTPayload | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: async () => {},
});

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: JWTPayload | null;
}) {
  const [user, setUser] = useState<JWTPayload | null>(initialUser);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
