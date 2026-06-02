"use client";

import React from "react";
import { useDomain } from "@/lib/context/domain-context";
import { X, Trash2, ShieldCheck, Clock, User } from "lucide-react";

interface AuditLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogsDrawer({ isOpen, onClose }: AuditLogsDrawerProps) {
  const { logs, clearLogs } = useDomain();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background/95 border-l border-border shadow-2xl flex flex-col transition-transform duration-300 animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h2 className="text-md font-semibold text-foreground">Log de Auditoria Interna</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Logs Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-2 stroke-[1.5]" />
              <p className="text-sm">Nenhum evento registrado no log.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Selecione ou alterne domínios para gerar logs.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-card border border-border hover:border-muted-foreground/30 transition flex flex-col gap-2 relative overflow-hidden"
              >
                {/* ID Tag */}
                <div className="absolute top-2 right-2 text-[9px] font-mono text-muted-foreground/80 bg-background px-1.5 py-0.5 rounded border border-border">
                  ID: {log.id}
                </div>

                {/* Action/Description */}
                <div className="text-xs text-foreground font-medium pr-16 line-clamp-2">
                  {log.action}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                  {/* User Profile */}
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground/60" />
                    <span className="font-semibold text-foreground/80">{log.profile}</span>
                  </div>

                  {/* Millisecond Timestamp (CA05 requirement) */}
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-muted-foreground/60" />
                    <span>{log.timestamp} ms</span>
                  </div>
                </div>

                {/* Human readable date */}
                <div className="text-[9px] text-muted-foreground/50 italic">
                  {new Date(log.timestamp).toLocaleString("pt-BR")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/20 backdrop-blur-md flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            Registros ativos: {logs.length}
          </span>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-950/10 rounded-md border border-rose-200/20 dark:border-rose-900/30 hover:border-rose-800/40 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar Logs
            </button>
          )}
        </div>
      </div>
    </>
  );
}
