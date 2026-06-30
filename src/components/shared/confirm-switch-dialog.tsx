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
  const { t,
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
              {t("ui_aviso_de_limpeza_de_308")}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed pt-2">
            {t("ui_voc_solicitou_a_altern_67")}{" "}
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
            {t("ui_para_garantir_a_integridade_911")}<span className="font-semibold text-amber-500"> {t("ui_contamina_o_estat_stica_285")}</span>
            {t("ui_entre_modelos_preditivos_a_5")}<span className="font-semibold text-foreground"> reset de contexto total</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 bg-muted/40 border border-border/80 rounded-lg flex items-start gap-2.5 text-xs text-muted-foreground">
          <RefreshCw className="h-4 w-4 text-muted-foreground/60 mt-0.5 animate-spin" style={{ animationDuration: "3s" }} />
          <div>
            <span className="font-semibold text-foreground">{t("ui_a_o_do_sistema_24")}</span> {t("ui_reset_de_metadados_tempor_996")}</div>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={cancelDomainSwitch}
            className="text-muted-foreground hover:text-foreground hover:bg-accent border-border"
          >
            {t("ui_cancelar_transi_o_739")}</Button>
          <Button
            variant="default"
            onClick={confirmDomainSwitch}
            className="bg-amber-600 hover:bg-amber-500 text-white font-semibold transition"
          >
            {t("ui_confirmar_limpeza_e_prosseguir_472")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
