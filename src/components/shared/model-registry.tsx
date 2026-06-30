"use client";

import React, { useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Tag, PlayCircle, Archive, CheckCircle2, AlertCircle, FileText, Download } from "lucide-react";

interface ModelVersion {
  id: string;
  version: string;
  date: string;
  algorithm: string;
  accuracy: number;
  f1Score: number;
  status: "production" | "archived" | "testing" | "failed";
  author: string;
}

export function ModelRegistry() {
  const { t, activeDomain, trainedModels } = useDomain();
  const currentModel = activeDomain ? trainedModels[activeDomain] : null;

  // Mocking historical versions based on the active domain
  const getMockHistory = (): ModelVersion[] => {
    const history: ModelVersion[] = [];
    
    if (currentModel) {
      history.push({
        id: currentModel.modelId,
        version: currentModel.version || "v2.0.0",
        date: new Date(currentModel.timestamp).toLocaleDateString(),
        algorithm: currentModel.algorithm || "XGBoost",
        accuracy: currentModel.metrics.accuracy || 94.5,
        f1Score: currentModel.metrics.f1Score || 92.1,
        status: "production",
        author: "Sistema Automático",
      });
    }

    // Add some mocked previous versions
    history.push({
      id: "mod-1992-abc",
      version: "v1.4.2",
      date: "12/05/2026",
      algorithm: "Random Forest",
      accuracy: 91.2,
      f1Score: 89.4,
      status: "archived",
      author: "João Silva",
    });

    history.push({
      id: "mod-1884-xyz",
      version: "v1.5.0-beta",
      date: "28/05/2026",
      algorithm: "Gradient Boosting",
      accuracy: 95.1,
      f1Score: 93.8,
      status: "testing",
      author: "Maria Data Scientist",
    });

    history.push({
      id: "mod-1102-err",
      version: "v1.3.0",
      date: "10/02/2026",
      algorithm: "Logistic Regression",
      accuracy: 78.5,
      f1Score: 75.2,
      status: "failed",
      author: "Sistema Automático",
    });

    return history.sort((a, b) => {
      if (a.status === "production") return -1;
      if (b.status === "production") return 1;
      return 0;
    });
  };

  const [versions] = useState<ModelVersion[]>(getMockHistory());

  const getStatusBadge = (status: ModelVersion["status"]) => {
    switch (status) {
      case "production":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><CheckCircle2 className="h-3 w-3" /> {t("ui_produ_o_930")}</span>;
      case "testing":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20"><PlayCircle className="h-3 w-3" /> {t("ui_em_teste_a_b_681")}</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20"><AlertCircle className="h-3 w-3" /> {t("ui_falhou_drift_844")}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"><Archive className="h-3 w-3" /> {t("ui_arquivado_635")}</span>;
    }
  };

  return (
    <Card className="border-border/60 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-500" />
              {t("ui_model_registry_ciclo_de_634")}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {t("ui_gerencie_todas_as_vers_699")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
            <Download className="h-4 w-4 mr-2" />
            {t("ui_exportar_logs_513")}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border border-border overflow-hidden bg-card/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-4 py-3">{t("ui_vers_o_tag_724")}</th>
                <th className="px-4 py-3">{t("ui_algoritmo_563")}</th>
                <th className="px-4 py-3">{t("ui_acur_cia_f1_34")}</th>
                <th className="px-4 py-3">{t("ui_data_autor_497")}</th>
                <th className="px-4 py-3 text-right">{t("ui_status_149")}</th>
                <th className="px-4 py-3 text-right">{t("ui_a_es_613")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {versions.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {v.version}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate w-24">
                      {v.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">
                    {v.algorithm}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className={v.accuracy > 90 ? "text-emerald-500 font-semibold" : "text-amber-500"}>{t("ui_acc_655")}{v.accuracy.toFixed(1)}%</span>
                      <span className="text-muted-foreground text-[10px]">{t("ui_f1_790")}{v.f1Score.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div>{v.date}</div>
                    <div className="text-[10px] text-muted-foreground">{v.author}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {getStatusBadge(v.status)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 flex justify-end items-center mt-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title={t("ui_ver_certificado_de_valida_166")}>
                      <FileText className="h-4 w-4 text-blue-500" />
                    </Button>
                    {v.status !== "production" && (
                      <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                        {t("ui_promover_396")}</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {versions.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {t("ui_nenhum_modelo_encontrado_no_463")}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
