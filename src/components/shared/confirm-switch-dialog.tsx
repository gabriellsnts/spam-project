"use client";

import React from "react";
import { useDomain, DOMAINS } from "@/lib/context/domain-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export function ConfirmSwitchDialog() {
  const {
    activeDomain,
    confirmSwitchOpen,
    pendingDomain,
    confirmDomainSwitch,
    cancelDomainSwitch,
  } = useDomain();

  const currentDomainInfo = activeDomain ? DOMAINS[activeDomain] : null;
  const targetDomainInfo = pendingDomain ? DOMAINS[pendingDomain] : null;

  return (
    <Dialog open={confirmSwitchOpen} onOpenChange={(open) => {
      if (!open) {
        cancelDomainSwitch();
      }
    }}>
      <DialogContent className="max-w-md bg-background border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <DialogTitle className="text-foreground font-bold text-base">
              Aviso de Limpeza de Contexto Analítico (CA06)
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed pt-2">
            Você solicitou a alternância de domínio de análise de{" "}
            <span className="font-semibold text-foreground">
              {currentDomainInfo?.name}
            </span>{" "}
            para{" "}
            <span className="font-semibold text-foreground">
              {targetDomainInfo?.name}
            </span>
            .
            <br />
            <br />
            Para garantir a integridade analítica e eliminar qualquer risco de
            <span className="font-semibold text-amber-500"> contaminação estatística cruzada </span>
            entre modelos preditivos, a memória volátil da aplicação será limpa, resultando em um
            <span className="font-semibold text-foreground"> reset de contexto total</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted/40 border border-border/80 rounded-lg flex items-start gap-2.5 text-xs text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-muted-foreground/60 mt-0.5 animate-spin" style={{ animationDuration: "3s" }} />
          <div>
            <span className="font-semibold text-foreground">Ação do Sistema:</span> Reset de metadados temporários e recarregamento limpo de parâmetros do novo modelo.
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={cancelDomainSwitch}
            className="text-muted-foreground hover:text-foreground hover:bg-accent border-border"
          >
            Cancelar transição
          </Button>
          <Button
            variant="default"
            onClick={confirmDomainSwitch}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold transition"
          >
            Confirmar Limpeza e Prosseguir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
