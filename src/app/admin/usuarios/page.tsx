"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { Button } from "@/components/ui/button";
import { UserManagement } from "@/components/shared/user-management";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { currentUser, isAuthLoading } = useDomain();
  const router = useRouter();

  // Redirecionamento se não for administrador
  useEffect(() => {
    if (!isAuthLoading && (!currentUser || currentUser.profileName !== "Administrador")) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400 text-sm">Validando permissões de acesso...</span>
      </div>
    );
  }

  if (!currentUser || currentUser.profileName !== "Administrador") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[80px] pointer-events-none z-0" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-4">
          <div className="h-12 w-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 uppercase tracking-wider">Acesso Restrito</h1>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Esta área é acessível apenas por administradores do sistema. Você não possui as credenciais necessárias. Redirecionando para a página inicial...
          </p>
          <Button onClick={() => router.push("/")} className="mt-4 bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 text-xs">
            Voltar ao Painel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-green-500/20 selection:text-green-400 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg text-zinc-500/[0.04] dark:text-zinc-400/[0.02] pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <Header />

      <div className="flex flex-1 relative z-10">
        <Sidebar />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10 animate-in fade-in duration-500 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-tight text-zinc-100 uppercase">
                Gerenciamento de Usuários
              </h1>
              <p className="text-zinc-500 text-xs mt-1">
                Cadastre novos perfis de acesso e controle o status das contas existentes.
              </p>
            </div>
            <Link href="/" passHref legacyBehavior>
              <Button variant="outline" size="sm" className="text-xs gap-1 border-zinc-800 hover:bg-zinc-900 transition">
                <ArrowLeft className="h-3.5 w-3.5" />
                Painel Inicial
              </Button>
            </Link>
          </div>

          <UserManagement />
        </main>
      </div>
    </div>
  );
}
