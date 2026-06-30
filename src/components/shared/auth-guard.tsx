"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Activity } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { t, currentUser, isAuthLoading } = useDomain();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthLoading) return;

    const isLoginPage = pathname === "/login" || pathname.endsWith("/login/");

    if (!currentUser && !isLoginPage) {
      router.push("/login");
    } else if (currentUser && isLoginPage) {
      router.push("/");
    }
  }, [currentUser, isAuthLoading, pathname, router]);

  // Exibe tela de carregamento premium enquanto valida a sessão no sessionStorage
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_25px_rgba(34,197,94,0.4)] animate-pulse">
            <Activity className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-zinc-200 font-extrabold text-sm tracking-wider uppercase">{t("ui_spam_system_382")}</span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-tight mt-1">{t("ui_carregando_credenciais_seguras_464")}</span>
          </div>
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === "/login" || pathname.endsWith("/login/");

  // Impede renderização dos filhos se não autenticado (evita vazamento de UI antes do redirect)
  if (!currentUser && !isLoginPage) {
    return null;
  }

  // Impede renderização da página de login se já autenticado
  if (currentUser && isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
