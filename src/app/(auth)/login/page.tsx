"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
import { Activity, User, Lock, AlertCircle, ShieldAlert, Key, RefreshCw, CheckCircle2, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  username: z.string().min(1, "auth_username_required"),
  password: z.string().min(1, "auth_password_required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isUserLocked, resetAttempts, t, language, setLanguage } = useDomain();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showInactivityAlert, setShowInactivityAlert] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const usernameValue = watch("username");

  // CA04: Verificar se o usuário foi redirecionado por inatividade
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "inactivity") {
      setShowInactivityAlert(true);
    }
  }, [searchParams]);

  // Verificar periodicamente (ou ao digitar o usuário) se a conta está bloqueada
  useEffect(() => {
    if (usernameValue?.trim()) {
      setIsLocked(isUserLocked(usernameValue));
    } else {
      setIsLocked(false);
    }
  }, [usernameValue, isUserLocked]);

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await login(data.username, data.password);
      if (result.success) {
        setSuccessMsg(t("auth_success_redirecting"));
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setErrorMsg(result.message);
        setIsLocked(isUserLocked(data.username));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t("auth_server_error"));
    }
  };

  const handleQuickFill = (userType: "admin" | "gestor") => {
    setErrorMsg(null);
    if (userType === "admin") {
      setValue("username", "admin", { shouldValidate: true });
      setValue("password", "admin123", { shouldValidate: true });
    } else {
      setValue("username", "gestor", { shouldValidate: true });
      setValue("password", "spam2026", { shouldValidate: true });
    }
  };

  const handleUnlockTest = () => {
    if (usernameValue) {
      resetAttempts(usernameValue);
      setIsLocked(false);
      setErrorMsg(null);
      setSuccessMsg(t("auth_account_unlocked"));
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 grid-bg text-zinc-500/[0.03] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Language Switcher on Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          className="h-9 gap-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition px-2 py-0.5 rounded-lg flex items-center justify-center align-middle"
          title={language === "en" ? "Change Language" : language === "es" ? "Cambiar Idioma" : "Alterar Idioma"}
          type="button"
        >
          <Globe className="h-4.5 w-4.5" />
          <span className="text-[10px] uppercase font-black tracking-wider hidden sm:inline">{language}</span>
          <ChevronDown className={cn("h-3 w-3 opacity-60 transition-transform duration-200 hidden sm:inline", langDropdownOpen && "rotate-180")} />
        </Button>
        {langDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setLangDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-1.5 w-32 bg-background border border-border/80 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                type="button"
                onClick={() => {
                  setLanguage("pt");
                  setLangDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  language === "pt" ? "bg-emerald-500/10 text-emerald-550" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="text-sm">🇧🇷</span>
                <span>{t("ui_portugu_s_903")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  setLangDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  language === "en" ? "bg-emerald-500/10 text-emerald-550" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="text-sm">🇺🇸</span>
                <span>{t("ui_english_887")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("es");
                  setLangDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer",
                  language === "es" ? "bg-emerald-500/10 text-emerald-550" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="text-sm">🇪🇸</span>
                <span>{t("ui_espa_ol_542")}</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in duration-500">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-green-500 flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_25px_rgba(34,197,94,0.3)] mb-2">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-zinc-100 uppercase">{t("auth_app_name")}</h1>
          <p className="text-zinc-500 text-xs font-medium max-w-xs">
            {t("auth_app_subtitle")}
          </p>
        </div>

        {/* Inactivity Alert */}
        {showInactivityAlert && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs shadow-sm animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">{t("auth_session_expired_title")}</p>
              <p className="opacity-90">{t("auth_session_expired_desc")}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <Card className="border-border/80 bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-zinc-100">
              {isLocked ? (t("auth_locked_title")) : (t("auth_identify_title"))}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              {isLocked 
                ? (t("auth_locked_desc")) 
                : (t("auth_identify_desc"))}
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

            {/* Error Feedback */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-xs animate-in zoom-in-95">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {isLocked ? (
              /* Lockout Screen */
              <div className="space-y-4 py-2 animate-in fade-in duration-300">
                <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center space-y-3">
                  <ShieldAlert className="h-10 w-10 text-red-500 animate-bounce" />
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                    {t("auth_locked_msg1")} <strong>{t("auth_locked_msg2")}</strong> {t("auth_locked_msg3")} <strong>{t("ui_quot_247")}{usernameValue}{t("ui_quot_973")}</strong> {t("auth_locked_msg4")}
                  </p>
                  <p className="text-xs font-semibold text-zinc-300 border-t border-zinc-800 pt-2 w-full">
                    {t("auth_locked_contact_admin")}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setValue("username", "");
                      setValue("password", "");
                      setErrorMsg(null);
                    }}
                    className="w-full text-xs hover:bg-zinc-800 hover:text-white transition"
                    type="button"
                  >
                    {t("auth_try_another_user")}
                  </Button>
                  
                  {/* Desbloqueio rápido para Testes/Reviewer */}
                  <Button 
                    onClick={handleUnlockTest}
                    variant="ghost" 
                    className="w-full text-[10px] text-zinc-600 hover:text-red-400 hover:bg-red-500/5 gap-1 transition"
                    type="button"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin-slow" />
                    {t("auth_simulate_unlock")}
                  </Button>
                </div>
              </div>
            ) : (
              /* Standard Form (Hook Form) */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t("auth_username_label")}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      {...register("username")}
                      type="text"
                      placeholder={t("auth_username_placeholder")}
                      disabled={isSubmitting}
                      tabIndex={1}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-sm font-medium transition"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-[10px] text-red-400 font-semibold">{t(errors.username.message as string) || errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t("auth_password_label")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      tabIndex={2}
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none text-zinc-200 text-sm font-medium transition"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-400 font-semibold">{t(errors.password.message as string) || errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  tabIndex={3}
                  className="w-full h-10 bg-green-500 hover:bg-green-600 text-zinc-950 font-bold rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-200"
                >
                  {isSubmitting ? (t("auth_authenticating")) : (t("auth_submit_btn"))}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>

        {/* Quick Testing Panel (Barra de Depuração) */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold">
            <Key className="h-3.5 w-3.5 text-green-500" />
            <span>{t("auth_debug_tools")}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin")}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-1.5 px-2 rounded-md text-left transition"
            >
              <div className="font-bold text-green-500">{t("auth_autofill_admin")}</div>
              <div className="opacity-75 font-mono">{t("ui_admin_admin123_579")}</div>
            </button>
            
            <button
              type="button"
              onClick={() => handleQuickFill("gestor")}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 py-1.5 px-2 rounded-md text-left transition"
            >
              <div className="font-bold text-violet-400">{t("auth_autofill_manager")}</div>
              <div className="opacity-75 font-mono">{t("ui_gestor_spam2026_818")}</div>
            </button>
          </div>
          
          <div className="text-[9px] text-zinc-600 text-center leading-normal">
            * {t("auth_debug_note1")}<br />
            * {t("auth_debug_note2")}
          </div>
        </div>

        {/* Footer */}
        <div className="text-zinc-600/40 text-[9px] text-center font-mono">
          {t("auth_footer")}
        </div>

      </div>
    </div>
  );
}
