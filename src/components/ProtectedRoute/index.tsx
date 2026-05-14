"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  if (isCheckingAuth || !isAuthenticated) {
    return <div className="p-8 text-title">Verificando acesso...</div>;
  }

  return children;
};
