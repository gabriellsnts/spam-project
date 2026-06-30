"use client";

import React, { useEffect } from "react";
import { useDomain, SimulatedEmail, DOMAINS } from "@/lib/context/domain-context";
import { X, Mail, AlertTriangle, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmailNotificationsRenderer() {
  const { t, sentEmails } = useDomain();

  // Função para remover um e-mail individual da tela (se quisermos)
  const [activeEmails, setActiveEmails] = React.useState<SimulatedEmail[]>([]);

  useEffect(() => {
    setActiveEmails(sentEmails);
  }, [sentEmails]);

  const dismissEmail = (id: string) => {
    setActiveEmails(prev => prev.filter(e => e.id !== id));
  };

  if (activeEmails.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-4 w-full max-w-md pointer-events-none">
      {activeEmails.map((email) => {
        const domainMeta = DOMAINS[email.domain];
        const dateStr = new Date(email.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        return (
          <div
            key={email.id}
            className="w-full pointer-events-auto bg-zinc-950/90 dark:bg-zinc-950/95 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl animate-in slide-in-from-right duration-550 ease-out"
          >
            {/* Cabeçalho do Email Simulado */}
            <div className="p-4 border-b border-zinc-800/60 bg-gradient-to-r from-zinc-900 to-zinc-950/50 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <Mail className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    {t("ui_e_mail_enviado_com_44")}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {t("ui_para_253")}<span className="text-emerald-400 font-bold">{email.recipient}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissEmail(email.id)}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Informações Gerais */}
            <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-500" />
                {t("ui_disparado_s_340")}{dateStr}
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border",
                domainMeta.accentClass
              )}>
                {domainMeta.name}
              </span>
            </div>

            {/* Conteúdo do E-mail: Alertas Críticos ou Relatório de Agendamento */}
            {email.isScheduledReport ? (
              <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t("ui_relat_rio_t_cnico_106")}</div>

                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/50 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-150">
                      {t("ui_mecanismo_de_agendamento_632")}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded border font-black uppercase shrink-0",
                      email.scheduleStatus === "success" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      {email.scheduleStatus === "success" ? "Sucesso" : "Falha"}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {email.scheduleStatus === "success" ? (
                      <div>
                        <p className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          {t("ui_processamento_autom_tico_conclu_84")}</p>
                        <p className="text-zinc-400 text-[11px]">
                          {t("ui_o_modelo_preditivo_foi_346")}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          {t("ui_falha_na_execu_o_996")}</p>
                        <p className="text-rose-400/95 font-mono text-[10px] bg-rose-950/20 border border-rose-900/30 p-2 rounded-lg leading-normal">
                          {email.errorDescription}
                        </p>
                        <p className="text-zinc-400 text-[10px] mt-2 italic">
                          {t("ui_mecanismo_fallback_ativo_o_49")}</p>
                      </div>
                    )}
                  </div>

                  {email.scheduleStatus === "success" && email.metricsSummary && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/40 text-[10px] font-mono">
                      {email.domain === "churn" || email.domain === "credit-risk" ? (
                        <>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-sans">{t("ui_acur_cia_354")}</span>
                            <span className="text-zinc-200 font-bold">
                              {email.metricsSummary.accuracy ? `${(email.metricsSummary.accuracy * 100).toFixed(2)}%` : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-sans">{t("ui_f1_score_460")}</span>
                            <span className="text-zinc-200 font-bold">
                              {email.metricsSummary.f1Score ? `${(email.metricsSummary.f1Score * 100).toFixed(2)}%` : "N/A"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-sans">{t("ui_coef_determina_o_r_899")}</span>
                            <span className="text-zinc-200 font-bold">
                              {email.metricsSummary.r2 ? email.metricsSummary.r2.toFixed(4) : "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase font-sans">{t("ui_rmse_erro_quadr_tico_426")}</span>
                            <span className="text-zinc-200 font-bold">
                              {email.metricsSummary.rmse ? email.metricsSummary.rmse.toFixed(4) : "N/A"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {t("ui_conte_do_do_alerta_314")}{email.alerts ? email.alerts.length : 0} item{email.alerts && email.alerts.length > 1 ? "s" : ""}{t("ui__317")}</div>

                <div className="space-y-2.5">
                  {email.alerts && email.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/50 hover:border-zinc-700/50 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          <span className="text-xs font-bold text-zinc-150 leading-tight">
                            {alert.item}
                          </span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-black uppercase shrink-0">
                          {t("ui_cr_tico_937")}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-zinc-800/40 text-[10px] font-mono">
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-sans">{t("ui_valor_atual_542")}</span>
                          <span className="text-zinc-200 font-bold">{alert.value}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[9px] uppercase font-sans">{t("ui_limiar_configurado_361")}</span>
                          <span className="text-zinc-200 font-bold">{t("ui_gt_115")}{alert.threshold}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rodapé Simulado */}
            <div className="px-4 py-3 bg-zinc-900/20 border-t border-zinc-800/40 flex items-center justify-between text-[9px] text-zinc-500">
              <span>{t("ui_e_mail_id_7")}{email.id}</span>
              <span className="font-semibold text-zinc-400 flex items-center gap-0.5">
                {t("ui_spam_system_515")}<ArrowRight className="h-2.5 w-2.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
