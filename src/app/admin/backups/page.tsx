"use client";

import React, { useState } from "react";
import { DatabaseBackup, RotateCcw, Trash2, CheckCircle, AlertTriangle, ShieldCheck, Clock, ShieldBan, HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDomain } from "@/lib/context/domain-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function BackupsPage() {
  const { 
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
            Backups do Sistema
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie e restaure snapshots completos de configurações, modelos e histórico do sistema.
          </p>
        </div>

        {isAdmin && (
          <Button 
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
            onClick={handleManualBackup}
          >
            <HardDrive className="h-4 w-4" />
            Criar Backup Manual Agora
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur border-border/50 shadow-xl md:col-span-1 h-fit">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground/80">
              <Clock className="h-4 w-4 text-sky-500" />
              Política de Retenção Automática
            </CardTitle>
            <CardDescription className="text-xs">
              Configure a periodicidade de snapshots e o limite máximo de armazenamento (CA01, CA04).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Frequência</label>
              <select 
                className="w-full bg-background border border-border/50 rounded-md text-sm p-2"
                value={localFreq}
                onChange={(e) => setLocalFreq(e.target.value as "daily" | "weekly" | "monthly" | "none")}
                disabled={!isAdmin}
              >
                <option value="none">Desativado</option>
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Limite Máximo de Snapshots</label>
              <input 
                type="number"
                min="1"
                max="20"
                className="w-full bg-background border border-border/50 rounded-md text-sm p-2"
                value={localMaxBackups}
                onChange={(e) => setLocalMaxBackups(e.target.value)}
                disabled={!isAdmin}
              />
              <p className="text-[10px] text-muted-foreground">Ao atingir o limite, o backup mais antigo será sobrescrito.</p>
            </div>

            {isAdmin && (
              <Button onClick={handleSaveConfig} className="w-full bg-sky-600 hover:bg-sky-700 text-white mt-2">
                Salvar Configurações
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur border-border/50 shadow-xl md:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Histórico de Backups ({(systemBackups || []).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!(systemBackups || []).length ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <DatabaseBackup className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm font-medium">Nenhum backup disponível.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Crie um backup manual ou configure a rotina automática.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/10 text-[11px] text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 font-semibold">Tipo</th>
                      <th className="p-3 font-semibold">Data/Hora</th>
                      <th className="p-3 font-semibold">Tamanho</th>
                      <th className="p-3 font-semibold">Integridade / Hash</th>
                      <th className="p-3 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-border/20">
                    {systemBackups.map((bkp) => (
                      <tr key={bkp.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3">
                          {bkp.type === "auto" ? (
                            <span className="px-2 py-1 bg-sky-500/10 text-sky-500 rounded-md border border-sky-500/20 text-xs font-semibold">Auto</span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20 text-xs font-semibold">Manual</span>
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
                              <RotateCcw className="h-3 w-3 mr-1" /> Restaurar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-[10px]"
                              onClick={() => setIsConfirmDeleteOpen(bkp.id)}
                              disabled={!isAdmin}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> Excluir
                            </Button>
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
              Restaurar Sistema?
            </DialogTitle>
            <DialogDescription>
              A restauração sobrescreverá <strong>todo o estado atual do sistema</strong> (modelos, alertas, lixeira, auditoria) com os dados do backup selecionado. Alterações não salvas serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmRestoreOpen(null)}>Cancelar</Button>
            <Button onClick={handleRestore} className="bg-emerald-600 hover:bg-emerald-700 text-white">Sim, Restaurar Backup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={!!isConfirmDeleteOpen} onOpenChange={(open) => !open && setIsConfirmDeleteOpen(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              Excluir Backup?
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir este snapshot permanentemente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">Confirmar Exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
