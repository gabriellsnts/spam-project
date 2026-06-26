"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/shared/user-management";
import { Sun, Moon, Laptop, Shield, User as UserIcon, Calendar, Building, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { currentUser, isAuthLoading, theme, setTheme } = useDomain();
  const router = useRouter();

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isAuthLoading, router]);

  if (isAuthLoading || !currentUser) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-zinc-400 font-semibold animate-pulse">Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.profileName === "Administrador";

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-100 uppercase">
          Perfil e Configurações
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Gerencie suas preferências visuais e acesse configurações administrativas da conta.
        </p>
      </div>

      <Tabs defaultValue="preferences" className="w-full">
        {/* Lista de abas (renderizadas condicionalmente) */}
        <div className="border-b border-zinc-800/80 pb-px mb-4">
          <TabsList className="bg-zinc-950/80 border border-zinc-800/80 p-1 rounded-xl h-11">
            <TabsTrigger 
              value="preferences" 
              className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-zinc-850 data-[state=active]:text-foreground data-[state=active]:border-zinc-700/50 data-[state=active]:shadow-sm"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Preferências
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger 
                value="admin" 
                className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-zinc-850 data-[state=active]:text-emerald-400 data-[state=active]:border-zinc-700/50 data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Gestão Administrativa
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Conteúdo: Preferências */}
        <TabsContent value="preferences" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Informações Básicas (Visual Premium) */}
            <Card className="md:col-span-1 border-border/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl flex flex-col justify-between">
              <CardHeader className="text-center pt-8 pb-4">
                <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-2xl shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
                  {currentUser.fullName
                    ? currentUser.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                    : "AD"}
                </div>
                <h2 className="text-lg font-bold text-zinc-100 mt-4 leading-tight">
                  {currentUser.fullName}
                </h2>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  @{currentUser.username}
                </p>
                <div className="flex justify-center mt-3">
                  <span className={cn(
                    "text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm",
                    isAdmin
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/25"
                  )}>
                    <Tag className="h-3 w-3" />
                    {currentUser.accessProfile}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="border-t border-zinc-800/60 pt-6 pb-8 space-y-4 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-zinc-500" />
                    Departamento
                  </span>
                  <span className="font-semibold text-zinc-200">{currentUser.department}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    Último Acesso
                  </span>
                  <span className="font-semibold text-zinc-200">
                    {currentUser.lastLogin 
                      ? new Date(currentUser.lastLogin).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "Recém-logado"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Aparência / Tema (RF52) */}
            <Card className="md:col-span-2 border-border/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Laptop className="h-4.5 w-4.5 text-emerald-500" />
                  Aparência do Painel
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Ajuste a paleta visual do ecossistema. O tema automático detecta e aplica a preferência do seu dispositivo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {/* Seletor Visual Nativo de Temas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tema Claro */}
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-3 group relative overflow-hidden",
                      theme === "light"
                        ? "bg-zinc-950/80 border-emerald-500/40 text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700/80 hover:bg-zinc-950/50"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-all duration-300",
                      theme === "light"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      <Sun className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold">Modo Claro</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Interface clara e suave</div>
                    </div>
                  </button>

                  {/* Tema Escuro */}
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-3 group relative overflow-hidden",
                      theme === "dark"
                        ? "bg-zinc-950/80 border-emerald-500/40 text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700/80 hover:bg-zinc-950/50"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-all duration-300",
                      theme === "dark"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      <Moon className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold">Modo Escuro</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Foco visual com economia de energia</div>
                    </div>
                  </button>

                  {/* Tema Sistema */}
                  <button
                    onClick={() => setTheme("auto")}
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300 gap-3 group relative overflow-hidden",
                      theme === "auto"
                        ? "bg-zinc-950/80 border-emerald-500/40 text-foreground shadow-md ring-1 ring-emerald-500/20"
                        : "bg-zinc-950/30 border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700/80 hover:bg-zinc-950/50"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-lg border transition-all duration-300",
                      theme === "auto"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                    )}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold">Sistema</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Sincroniza com as cores do seu SO</div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo: Gestão Administrativa */}
        {isAdmin && (
          <TabsContent value="admin" className="outline-none">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
