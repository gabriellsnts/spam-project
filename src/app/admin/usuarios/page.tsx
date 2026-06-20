"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, FileText, UserCheck, ShieldAlert, ArrowLeft, Check, X, Shield } from "lucide-react";
import Link from "next/link";

// Função para gerar Hash SHA-256 (CA02)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Analisador de força de senha (CA04)
const checkPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: "Sem Senha", color: "bg-zinc-800", textColor: "text-zinc-500", progress: 0 };
  
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

  if (pass.length < 6) {
    return { score: 1, label: "Fraca", color: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]", textColor: "text-red-400", progress: 25 };
  }

  if (score <= 1) {
    return { score: 1, label: "Fraca", color: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]", textColor: "text-red-400", progress: 25 };
  } else if (score === 2 || score === 3) {
    return { score: 3, label: "Média", color: "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]", textColor: "text-amber-400", progress: 65 };
  } else {
    return { score: 4, label: "Forte", color: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]", textColor: "text-emerald-400", progress: 100 };
  }
};

export default function AdminUsersPage() {
  const { currentUser, isAuthLoading, users, setUsers, addLog } = useDomain();
  const router = useRouter();

  // Estados do formulário
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState("Gestor Analítico");

  // Simulação de criptografia (CA02)
  const [simulatedHash, setSimulatedHash] = useState<string | null>(null);

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

  // Força da senha calculada em tempo real (CA04)
  const strength = checkPasswordStrength(password);
  const requirements = {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasNumberOrSpecial: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSimulatedHash(null);

    const cleanUsername = username.trim().toLowerCase();

    // Validações básicas (CA01: Bloquear vazios)
    if (!fullName.trim() || !cleanUsername || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg("Todos os campos do formulário são de preenchimento obrigatório.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("A senha e a confirmação de senha não coincidem.");
      return;
    }

    // Bloqueia se força for fraca (CA04: Força mínima obrigatória)
    if (strength.label === "Fraca") {
      setErrorMsg("A força da senha deve ser no mínimo 'Média' para poder cadastrar.");
      return;
    }

    // Validar duplicado (CA01: Bloquear duplicados)
    const userExists = users.some((u) => u.username === cleanUsername);
    if (userExists) {
      setErrorMsg(`O nome de usuário "${cleanUsername}" já está cadastrado no sistema.`);
      return;
    }

    // Simula a criptografia da senha antes de armazenar (CA02)
    const hash = await sha256(password);
    setSimulatedHash(hash);

    // Mapear perfis de acesso
    let profileName = "Analista";
    let accessProfile = "Analista de Dados";
    let department = "Negócios";

    if (profile === "Super Admin") {
      profileName = "Administrador";
      accessProfile = "Super Admin";
      department = "TI & Infraestrutura";
    } else if (profile === "Gestor Analítico") {
      profileName = "Gestor de Operações";
      accessProfile = "Gestor Analítico";
      department = "Operações";
    }

    const newUser = {
      username: cleanUsername,
      fullName: fullName.trim(),
      profileName,
      accessProfile,
      department,
      passwordHash: hash,
      lastLogin: new Date().toISOString(),
      status: "ativo" as const,
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem("spam-users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Registro automático no log de auditoria (CA03)
    addLog(`Cadastro de Usuário: Novo perfil '${cleanUsername}' (${profileName}) registrado pelo administrador '${currentUser.username}'.`);

    // Limpar campos
    setFullName("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setProfile("Gestor Analítico");

    setSuccessMsg(`Usuário "${cleanUsername}" cadastrado com sucesso! As credenciais foram registradas e criptografadas de forma segura (SHA-256: ${hash.substring(0, 16)}...).`);
  };

  const handleToggleStatus = (usernameToToggle: string) => {
    if (currentUser && usernameToToggle === currentUser.username) {
      alert("Por segurança, você não pode desativar a sua própria conta ativa de administrador.");
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.username === usernameToToggle) {
        const nextStatus: "ativo" | "inativo" = u.status === "ativo" ? "inativo" : "ativo";
        
        // Registrar log de auditoria
        addLog(`Status da conta '${u.username}' alterado para '${nextStatus}' pelo administrador '${currentUser.username}'.`);
        
        return { ...u, status: nextStatus };
      }
      return u;
    });

    localStorage.setItem("spam-users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
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
                    <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg animate-in zoom-in-95 leading-relaxed">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg animate-in zoom-in-95 leading-relaxed font-mono">
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

                    {/* Indicador de Força de Senha (CA04) */}
                    {password && (
                      <div className="pt-1.5 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-500 font-semibold">Força da Senha:</span>
                          <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                        </div>
                        {/* Barra de progresso visual */}
                        <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.progress}%` }} />
                        </div>
                        {/* Critérios de senha */}
                        <div className="grid grid-cols-1 gap-1 text-[9px] text-zinc-500 pt-1">
                          <div className="flex items-center gap-1">
                            {requirements.minLength ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                            <span>Pelo menos 6 caracteres</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {requirements.hasUpper ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-zinc-600" />}
                            <span>Uma letra maiúscula (A-Z)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {requirements.hasNumberOrSpecial ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-zinc-600" />}
                            <span>Um número ou caractere especial</span>
                          </div>
                        </div>
                      </div>
                    )}
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

                  {/* Mostra Simulação de Hash se disponível */}
                  {simulatedHash && (
                    <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1 text-[9px] font-mono text-zinc-400 animate-in zoom-in-95">
                      <div className="flex items-center gap-1 text-green-500 font-bold uppercase tracking-wider text-[8px]">
                        <Shield className="h-3 w-3 shrink-0" />
                        <span>Simulador de Hashing</span>
                      </div>
                      <div className="truncate">Algoritmo: SHA-256</div>
                      <div className="truncate font-semibold text-zinc-300">Hash: {simulatedHash}</div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={!!password && strength.label === "Fraca"}
                    className={`w-full h-9 text-xs font-bold transition shadow-sm ${
                      !!password && strength.label === "Fraca" 
                        ? "bg-zinc-850 text-zinc-500 cursor-not-allowed border border-zinc-800" 
                        : "bg-green-500 hover:bg-green-600 text-zinc-950"
                    }`}
                  >
                    {!!password && strength.label === "Fraca" ? "Força de Senha Insuficiente" : "Cadastrar Usuário"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Grid Coluna Tabela */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/80 bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    <User className="h-4.5 w-4.5 text-green-500" />
                    Usuários Cadastrados
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Lista completa de contas cadastradas e controle de status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                        <th className="py-3 px-4 font-bold">Nome</th>
                        <th className="py-3 px-4 font-bold">Usuário</th>
                        <th className="py-3 px-4 font-bold">Perfil</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.username} className="border-b border-zinc-850 hover:bg-zinc-950/40 transition duration-150">
                          <td className="py-3.5 px-4 font-medium text-zinc-200">{user.fullName}</td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono">@{user.username}</td>
                          <td className="py-3.5 px-4 text-zinc-300">
                            <div>{user.profileName}</div>
                            <div className="text-[9px] text-zinc-500">{user.accessProfile}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {user.status === "ativo" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/25">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                Inativo
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {user.username === currentUser.username ? (
                              <span className="text-[10px] text-zinc-600 font-bold italic mr-2 select-none">
                                Sua Conta (Ativa)
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleStatus(user.username)}
                                className={`text-[10px] font-bold h-7 py-1 px-3.5 rounded-md transition duration-200 border ${
                                  user.status === "ativo"
                                    ? "text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/20"
                                    : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/20"
                                }`}
                              >
                                {user.status === "ativo" ? "Desativar" : "Reativar"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                            Nenhum usuário cadastrado no sistema.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
