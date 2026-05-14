"use client";

import { getAuthUser, login, logout, AuthUser } from "@/services/auth";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUser(getAuthUser());
      setIsCheckingAuth(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const signIn = (email: string, password: string) => {
    const loggedUser = login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const signOut = () => {
    logout();
    setUser(null);
  };

  return {
    user,
    isCheckingAuth,
    isAuthenticated: user?.role === "ADMIN",
    signIn,
    signOut,
  };
};
