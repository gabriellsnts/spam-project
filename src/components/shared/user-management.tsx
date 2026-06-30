"use client";

import React, { useState, useEffect } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, FileText, UserCheck, Check, X, Shield } from "lucide-react";

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

export function UserManagement() {
  const { t, currentUser, users, setUsers, addLog, privacyNoticeText, savePrivacyNoticeText } = useDomain();

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

  // Estados das Diretrizes de Privacidade (RF39)
  const [localPrivacyText, setLocalPrivacyText] = useState("");
  const [privacySuccessMsg, setPrivacySuccessMsg] = useState<string | null>(null);
  const [privacyErrorMsg, setPrivacyErrorMsg] = useState<string | null>(null);

  // Sincronizar o aviso de privacidade global para o estado local
  useEffect(() => {
    if (privacyNoticeText) {
      setLocalPrivacyText(privacyNoticeText);
    }
  }, [privacyNoticeText]);

  // Força da senha calculada em tempo real (CA04)
  const strength = checkPasswordStrength(password);
  const requirements = {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasNumberOrSpecial: /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)
  };

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
    if (currentUser) {
      addLog(`Cadastro de Usuário: Novo perfil '${cleanUsername}' (${profileName}) registrado pelo administrador '${currentUser.username}'.`);
    }

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
        if (currentUser) {
          addLog(`Status da conta '${u.username}' alterado para '${nextStatus}' pelo administrador '${currentUser.username}'.`);
        }
        
        return { ...u, status: nextStatus };
      }
      return u;
    });

    localStorage.setItem("spam-users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-305">
      {/* Formulário de Cadastro (CA01) */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-green-500" />
              {t("ui_cadastrar_usu_rio_354")}</CardTitle>
            <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
              {t("ui_preencha_as_informa_es_981")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-550/20 text-red-650 dark:text-red-400 rounded-lg animate-in zoom-in-95 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400 rounded-lg animate-in zoom-in-95 leading-relaxed font-mono font-semibold">
                  {successMsg}
                </div>
              )}

              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider block">{t("ui_nome_completo_200")}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("ui_ex_jo_o_da_819")}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-850 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                  />
                </div>
              </div>

              {/* Usuário */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider block">{t("ui_usu_rio_801")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("ui_ex_joao_silva_952")}
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-850 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider block">{t("ui_senha_505")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-850 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                  />
                </div>

                {/* Indicador de Força de Senha (CA04) */}
                {password && (
                  <div className="pt-1.5 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-750 dark:text-zinc-500 font-semibold">{t("ui_for_a_da_senha_946")}</span>
                      <span className={`font-bold ${strength.textColor}`}>{strength.label}</span>
                    </div>
                    {/* Barra de progresso visual */}
                    <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.progress}%` }} />
                    </div>
                    {/* Critérios de senha */}
                    <div className="grid grid-cols-1 gap-1 text-[9px] text-slate-750 dark:text-zinc-500 pt-1">
                      <div className="flex items-center gap-1">
                        {requirements.minLength ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>{t("ui_pelo_menos_6_caracteres_41")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {requirements.hasUpper ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-zinc-600" />}
                        <span>{t("ui_uma_letra_mai_scula_647")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {requirements.hasNumberOrSpecial ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-zinc-600" />}
                        <span>{t("ui_um_n_mero_ou_909")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider block">{t("ui_confirmar_senha_441")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-zinc-950/80 border border-zinc-850 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition"
                  />
                </div>
              </div>

              {/* Perfil de Acesso */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider block">{t("ui_perfil_de_acesso_421")}</label>
                <select
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-zinc-950/80 border border-zinc-850 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-250 text-xs transition appearance-none cursor-pointer"
                >
                  <option value="Super Admin">{t("ui_administrador_super_admin_639")}</option>
                  <option value="Gestor Analítico">{t("ui_gestor_de_opera_es_198")}</option>
                  <option value="Analista de Dados">{t("ui_analista_analista_de_dados_873")}</option>
                </select>
              </div>

              {/* Mostra Simulação de Hash se disponível */}
              {simulatedHash && (
                <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/85 space-y-1 text-[9px] font-mono text-slate-700 dark:text-zinc-400 animate-in zoom-in-95">
                  <div className="flex items-center gap-1 text-green-500 font-bold uppercase tracking-wider text-[8px]">
                    <Shield className="h-3 w-3 shrink-0" />
                    <span>{t("ui_simulador_de_hashing_748")}</span>
                  </div>
                  <div className="truncate font-mono">{t("ui_algoritmo_sha_256_986")}</div>
                  <div className="truncate font-semibold text-zinc-350 font-mono">{t("ui_hash_772")}{simulatedHash}</div>
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

        {/* Diretrizes de Privacidade (RF39 - CA06) */}
        <Card className="border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-green-500" />
              {t("ui_diretrizes_de_privacidade_lgpd_662")}</CardTitle>
            <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
              {t("ui_configure_o_aviso_legal_196")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              setPrivacySuccessMsg(null);
              setPrivacyErrorMsg(null);
              if (!localPrivacyText.trim()) {
                setPrivacyErrorMsg("O texto do aviso de privacidade não pode estar vazio.");
                return;
              }
              savePrivacyNoticeText(localPrivacyText.trim());
              if (currentUser) {
                addLog(`Diretrizes de Privacidade (LGPD) atualizadas pelo administrador '${currentUser.username}'.`);
              }
              setPrivacySuccessMsg("Diretrizes de privacidade atualizadas com sucesso!");
            }} className="space-y-4">
              {privacyErrorMsg && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-550/20 text-red-650 dark:text-red-400 rounded-lg animate-in zoom-in-95 leading-relaxed">
                  {privacyErrorMsg}
                </div>
              )}

              {privacySuccessMsg && (
                <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-550/20 text-emerald-600 dark:text-emerald-400 rounded-lg animate-in zoom-in-95 leading-relaxed">
                  {privacySuccessMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-800 dark:text-zinc-400 uppercase tracking-wider block">
                  {t("ui_texto_do_aviso_de_354")}</label>
                <textarea
                  value={localPrivacyText}
                  onChange={(e) => setLocalPrivacyText(e.target.value)}
                  rows={8}
                  placeholder={t("ui_insira_o_aviso_legal_999")}
                  className="w-full p-3 rounded-lg bg-zinc-950/80 border border-zinc-850 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-xs transition resize-none leading-relaxed"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-xs font-bold bg-green-500 hover:bg-green-600 text-zinc-950 transition shadow-sm"
              >
                {t("ui_salvar_aviso_de_privacidade_657")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Grid Coluna Tabela */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-green-500" />
              {t("ui_usu_rios_cadastrados_704")}</CardTitle>
            <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
              {t("ui_lista_completa_de_contas_275")}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-slate-800 dark:text-zinc-400">
                  <th className="py-3 px-4 font-bold font-semibold">{t("ui_nome_118")}</th>
                  <th className="py-3 px-4 font-bold font-semibold">{t("ui_usu_rio_421")}</th>
                  <th className="py-3 px-4 font-bold font-semibold">{t("ui_perfil_138")}</th>
                  <th className="py-3 px-4 font-bold font-semibold">{t("ui_status_350")}</th>
                  <th className="py-3 px-4 font-bold text-right font-semibold">{t("ui_a_es_881")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.username} className="border-b border-zinc-150 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-950/40 transition duration-150">
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-zinc-200">{user.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-400 font-mono">@{user.username}</td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-zinc-300">
                      <div>{user.profileName}</div>
                      <div className="text-[9px] text-slate-700 dark:text-zinc-400 font-semibold">{user.accessProfile}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {user.status === "ativo" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {t("ui_ativo_227")}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-655 dark:text-red-400 border border-red-500/25">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          {t("ui_inativo_174")}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {currentUser && user.username === currentUser.username ? (
                        <span className="text-[10px] text-slate-650 dark:text-zinc-650 font-bold italic mr-2 select-none">
                          {t("ui_sua_conta_ativa_495")}</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(user.username)}
                          className={`text-[10px] font-bold h-7 py-1 px-3.5 rounded-md transition duration-200 border ${
                            user.status === "ativo"
                              ? "text-red-650 hover:text-red-500 hover:bg-red-500/10 border-red-500/10 hover:border-red-500/20"
                              : "text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/20"
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
                      {t("ui_nenhum_usu_rio_cadastrado_446")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
