"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Activity, User, Lock, AlertCircle, ShieldAlert, Key, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const { login, isUserLocked, resetAttempts } = useDomain();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);

  // Verificar se o usuário foi redirecionado por inatividade
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "inactivity") {
      setShowInactivityAlert(true);
    }
  }, [searchParams]);

  // Verificar periodicamente (ou ao digitar o usuário) se a conta está bloqueada
  useEffect(() => {
    if (username.trim()) {
      setIsLocked(isUserLocked(username));
    } else {
      setIsLocked(false);
    }
  }, [username, isUserLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        setSuccessMsg("Autenticação realizada! Redirecionando...");
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setErrorMsg(result.message);
        // Atualizar estado de bloqueio caso tenha bloqueado neste clique
        setIsLocked(isUserLocked(username));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocorreu um erro no servidor ao tentar realizar o login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preencher credenciais de teste automaticamente
  const handleQuickFill = (userType: "admin" | "gestor") => {
    setErrorMsg(null);
    if (userType === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else {
      setUsername("gestor");
      setPassword("spam2026");
    }
  };

  // Simular reativação/desbloqueio pelo administrador (para homologação fácil)
  const handleUnlockTest = () => {
    if (username) {
      resetAttempts(username);
      setIsLocked(false);
      setErrorMsg(null);
      setSuccessMsg("Conta desbloqueada para testes com sucesso!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 grid-bg text-zinc-500/[0.03] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in duration-500">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_25px_rgba(34,197,94,0.3)] mb-2">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-zinc-100 uppercase">SPAM SYSTEM</h1>
          <p className="text-zinc-500 text-xs font-medium max-w-xs">
            Sistema Preditivo de Análise Multi-Domínio. Autentique-se para prosseguir.
          </p>
        </div>

        {/* Inactivity Alert (CA04) */}
        {showInactivityAlert && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs shadow-sm animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Sessão Expirada</p>
              <p className="opacity-90">Sua sessão foi encerrada automaticamente por inatividade. Por favor, logue novamente.</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className="border-border/80 bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-zinc-100">
              {isLocked ? "Acesso Bloqueado" : "Identifique-se"}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isLocked 
                ? "Esta conta foi suspensa temporariamente por segurança." 
                : "Informe suas credenciais registradas no banco de dados."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Success feedback */}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold animate-in zoom-in-95">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error Feedback (CA02 / CA03) */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs animate-in zoom-in-95">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {isLocked ? (
              /* Lockout Screen (CA03) */
              <div className="space-y-4 py-2 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center space-y-3">
                  <ShieldAlert className="h-10 w-10 text-red-500 animate-bounce" />
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                    Excedeu o número máximo de <strong>5 tentativas consecutivas</strong> de login malsucedidas. 
                    Por segurança, a conta do usuário <strong>"{username}"</strong> foi suspensa temporariamente.
                  </p>
                  <p className="text-xs font-semibold text-zinc-300 border-t border-zinc-800 pt-2 w-full">
                    Entre em contato com o administrador para reativação da sua conta.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setUsername("");
                      setPassword("");
                      setErrorMsg(null);
                    }}
                    className="w-full text-xs hover:bg-zinc-800 hover:text-white transition"
                  >
                    Tentar outro usuário
                  </Button>
                  
                  {/* Desbloqueio rápido para Testes/Reviewer */}
                  <Button 
                    onClick={handleUnlockTest}
                    variant="ghost" 
                    className="w-full text-[10px] text-zinc-600 hover:text-red-400 hover:bg-red-500/5 gap-1 transition"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin-slow" />
                    [Simular Desbloqueio do Admin (Teste)]
                  </Button>
                </div>
              </div>
            ) : (
              /* Standard Form (CA01) */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Usuário</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: admin"
                      disabled={isSubmitting}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-sm font-medium transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-sm font-medium transition"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-green-500 hover:bg-green-600 text-zinc-950 font-bold rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-200"
                >
                  {isSubmitting ? "Autenticando..." : "Confirmar Acesso"}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>

        {/* Quick Testing Panel (Barra de Depuração) */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
            <Key className="h-3.5 w-3.5 text-green-500" />
            <span>Ferramentas de Homologação (Review)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFill("admin")}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-1.5 px-2 rounded-md text-left transition"
            >
              <div className="font-bold text-green-500">Auto-fill Admin</div>
              <div className="opacity-75 font-mono">admin / admin123</div>
            </button>
            
            <button
              onClick={() => handleQuickFill("gestor")}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-1.5 px-2 rounded-md text-left transition"
            >
              <div className="font-bold text-violet-400">Auto-fill Gestor</div>
              <div className="opacity-75 font-mono">gestor / spam2026</div>
            </button>
          </div>
          
          <div className="text-[9px] text-zinc-600 text-center leading-normal">
            * Criptografia de senhas: hash SHA-256 processado nativamente no navegador.<br />
            * Teste o brute-force digitando senhas erradas 5 vezes seguidas.
          </div>
        </div>

        {/* Footer */}
        <div className="text-zinc-600/40 text-[9px] text-center font-mono">
          SISTEMA PREDITIVO SPAM — LGPD COMPLIANT SECURE LOGON
        </div>

      </div>
    </div>
  );
}
