"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, FileText, UserCheck, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { currentUser, isAuthLoading } = useDomain();
  const router = useRouter();

  // Estados do formulário
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState("Gestor Analítico");

  // Feedbacks
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validações básicas (CA01: Bloquear vazios)
    if (!fullName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg("Todos os campos do formulário são de preenchimento obrigatório.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("A senha e a confirmação de senha não coincidem.");
      return;
    }

    // Temporário para verificação visual no Passo 1
    setSuccessMsg("Formulário validado com sucesso! (Cadastro completo nos próximos passos)");
  };

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
              <h1 className="text-2xl font-black tracking-tight leading-tight text-zinc-100">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de Cadastro (CA01) */}
            <Card className="lg:col-span-1 border-border/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <UserCheck className="h-4.5 w-4.5 text-green-500" />
                  Cadastrar Usuário
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Preencha as informações obrigatórias para criar uma nova conta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg animate-in zoom-in-95">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg animate-in zoom-in-95">
                      {successMsg}
                    </div>
                  )}

                  {/* Nome Completo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nome Completo</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                      />
                    </div>
                  </div>

                  {/* Usuário */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Usuário</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ex: joao.silva"
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                      />
                    </div>
                  </div>

                  {/* Confirmar Senha */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                      />
                    </div>
                  </div>

                  {/* Perfil de Acesso */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Perfil de Acesso</label>
                    <select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition appearance-none cursor-pointer"
                    >
                      <option value="Super Admin">Administrador (Super Admin)</option>
                      <option value="Gestor Analítico">Gestor de Operações (Gestor Analítico)</option>
                      <option value="Analista de Dados">Analista (Analista de Dados)</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full h-9 text-xs bg-green-500 hover:bg-green-600 text-zinc-950 font-bold transition">
                    Cadastrar Usuário
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Grid Coluna Tabela (Vazia/Carregando no Passo 1) */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg h-full flex flex-col justify-center items-center p-8 text-center min-h-[350px]">
                <div className="h-10 w-10 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-3">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-zinc-300 font-semibold text-sm">Visualização de Listagem</span>
                <span className="text-zinc-500 text-xs max-w-xs mt-1.5 leading-relaxed">
                  A listagem de usuários cadastrados e o controle de status ativo/inativo serão exibidos aqui após a conclusão das etapas de validação de segurança.
                </span>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
