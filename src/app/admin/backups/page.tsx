"use client";

import React, { useState } from "react";
import { DatabaseBackup, RotateCcw, Trash2, CheckCircle, AlertTriangle, ShieldCheck, Clock, ShieldBan, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDomain } from "@/lib/context/domain-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function BackupsPage() {
  const { t, 
          systemBackups, 
          backupConfig, 
          createBackup, 
          restoreBackup, 
          deleteBackup, 
          updateBackupConfig,
          currentUser 
        } = useDomain();

  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<string | null>(null);
  
  const [localMaxBackups, setLocalMaxBackups] = useState(backupConfig?.maxBackups?.toString() || "5");
  const [localFreq, setLocalFreq] = useState(backupConfig?.frequency || "none");

  const isAdmin = currentUser?.accessProfile === "Super Admin" || currentUser?.accessProfile === "Admin" || currentUser?.profileName === "Administrador";

  const handleSaveConfig = () => {
    updateBackupConfig({
      maxBackups: parseInt(localMaxBackups) || 5,
      frequency: localFreq as "daily" | "weekly" | "monthly" | "none"
    });
  };

  const handleManualBackup = () => {
    createBackup("manual");
  };

  const handleRestore = () => {
    if (isConfirmRestoreOpen) {
      restoreBackup(isConfirmRestoreOpen);
      setIsConfirmRestoreOpen(null);
    }
  };

  const handleDelete = () => {
    if (isConfirmDeleteOpen) {
      deleteBackup(isConfirmDeleteOpen);
      setIsConfirmDeleteOpen(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DatabaseBackup className="h-8 w-8 text-emerald-500" />
            {t("ui_backups_do_sistema_200")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("ui_gerencie_e_restaure_snapshots_399")}</p>
        </div>

        {isAdmin && (
          <Button 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            onClick={handleManualBackup}
          >
            <HardDrive className="h-4 w-4" />
            {t("ui_criar_backup_manual_agora_995")}</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur border-border/50 shadow-xl md:col-span-1 h-fit">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground/80">
              <Clock className="h-4 w-4 text-sky-500" />
              {t("ui_pol_tica_de_reten_216")}</CardTitle>
            <CardDescription className="text-xs">
              {t("ui_configure_a_periodicidade_de_250")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t("ui_frequ_ncia_183")}</label>
              <select 
                className="w-full bg-background border border-border/50 rounded-md text-sm p-2"
                value={localFreq}
                onChange={(e) => setLocalFreq(e.target.value as "daily" | "weekly" | "monthly" | "none")}
                disabled={!isAdmin}
              >
                <option value="none">{t("ui_desativado_589")}</option>
                <option value="daily">{t("ui_di_rio_541")}</option>
                <option value="weekly">{t("ui_semanal_948")}</option>
                <option value="monthly">{t("ui_mensal_30")}</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">{t("ui_limite_m_ximo_de_977")}</label>
              <input 
                type="number"
                min="1"
                max="20"
                className="w-full bg-background border border-border/50 rounded-md text-sm p-2"
                value={localMaxBackups}
                onChange={(e) => setLocalMaxBackups(e.target.value)}
                disabled={!isAdmin}
              />
              <p className="text-[10px] text-muted-foreground">{t("ui_ao_atingir_o_limite_727")}</p>
            </div>

            {isAdmin && (
              <Button onClick={handleSaveConfig} className="w-full bg-sky-600 hover:bg-sky-700 text-white mt-2">
                {t("ui_salvar_configura_es_29")}</Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50 shadow-xl md:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t("ui_hist_rico_de_backups_463")}{(systemBackups || []).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!(systemBackups || []).length ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <DatabaseBackup className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm font-medium">{t("ui_nenhum_backup_dispon_vel_924")}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{t("ui_crie_um_backup_manual_41")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/10 text-[11px] text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 font-semibold">{t("ui_tipo_996")}</th>
                      <th className="p-3 font-semibold">{t("ui_data_hora_114")}</th>
                      <th className="p-3 font-semibold">{t("ui_tamanho_104")}</th>
                      <th className="p-3 font-semibold">{t("ui_integridade_hash_480")}</th>
                      <th className="p-3 text-right font-semibold">{t("ui_a_es_745")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-border/20">
                    {systemBackups.map((bkp) => (
                      <tr key={bkp.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3">
                          {bkp.type === "auto" ? (
                            <span className="px-2 py-1 bg-sky-500/10 text-sky-500 rounded-md border border-sky-500/20 text-xs font-semibold">{t("ui_auto_608")}</span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20 text-xs font-semibold">{t("ui_manual_443")}</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(bkp.timestamp).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs font-mono">
                          {formatBytes(bkp.sizeBytes)}
                        </td>
                        <td className="p-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            {bkp.integrityStatus === "valid" ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <ShieldBan className="h-3.5 w-3.5 text-rose-500" />
                            )}
                            <span className="font-mono text-[10px] text-muted-foreground/70" title={bkp.hash}>
                              {bkp.hash.substring(0, 8)}...
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 text-[10px]"
                              onClick={() => setIsConfirmRestoreOpen(bkp.id)}
                              disabled={!isAdmin}
                            >
                              <RotateCcw className="h-3 w-3 mr-1" /> {t("ui_restaurar_286")}</Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-[10px]"
                              onClick={() => setIsConfirmDeleteOpen(bkp.id)}
                              disabled={!isAdmin}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> {t("ui_excluir_400")}</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Restore Modal */}
      <Dialog open={!!isConfirmRestoreOpen} onOpenChange={(open) => !open && setIsConfirmRestoreOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-500">
              <RotateCcw className="h-5 w-5" />
              {t("ui_restaurar_sistema_733")}</DialogTitle>
            <DialogDescription>
              {t("ui_a_restaura_o_sobrescrever_417")}<strong>{t("ui_todo_o_estado_atual_758")}</strong> {t("ui_modelos_alertas_lixeira_auditoria_832")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmRestoreOpen(null)}>{t("ui_cancelar_681")}</Button>
            <Button onClick={handleRestore} className="bg-emerald-600 hover:bg-emerald-700 text-white">{t("ui_sim_restaurar_backup_225")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={!!isConfirmDeleteOpen} onOpenChange={(open) => !open && setIsConfirmDeleteOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              {t("ui_excluir_backup_282")}</DialogTitle>
            <DialogDescription>
              {t("ui_voc_est_prestes_a_277")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(null)}>{t("ui_cancelar_235")}</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">{t("ui_confirmar_exclus_o_725")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
