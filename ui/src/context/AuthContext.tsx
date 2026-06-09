import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextDef";
import type { User } from "./authContextDef";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: User | null) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(() => {
    window.location.href = '/auth/login';
  }, []);

  const signOut = useCallback(() => {
    fetch("/auth/logout", {
      method: "POST",
      credentials: "include",
    }).finally(() => setUser(null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
