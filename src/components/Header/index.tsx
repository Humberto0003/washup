"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export const Header = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    toast.success("Você saiu do WashUp.");
    router.replace("/");
  };

  return (
    <header className="bg-header w-full pb-20">
      <div className="max-w-280 mx-auto px-4 pt-8 flex flex-col gap-6 xl:flex-row xl:justify-between xl:items-center">
        <Link
          href="/acompanhamento/operacional"
          className="flex flex-col text-white"
        >
          <span className="text-3xl font-bold leading-8">WashUp</span>
          <span className="text-sm text-white/80">
            Fila inteligente para lava jato
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
          <Link href="/acompanhamento/operacional" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/clientes" className="hover:text-white">
            Clientes
          </Link>
          <Link href="/fidelidade" className="hover:text-white">
            Fidelidade
          </Link>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-white/90">
            {user?.name ?? "Administrador WashUp"}
          </span>

          <button
            className="rounded-md border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
};
