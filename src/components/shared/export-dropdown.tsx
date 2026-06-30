"use client";

import React, { useState } from "react";
import { Download, FileJson, FileText, FileSpreadsheet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDomain } from "@/lib/context/domain-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ExportDropdownProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  filenamePrefix?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ExportDropdown({ data = [], filenamePrefix = "export" }: ExportDropdownProps) {
  const { t } = useDomain();
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, "-").split("T").join("_").slice(0, -5);
  };

  const handleExport = (format: "CSV" | "JSON" | "PDF") => {
    setExportingFormat(format);
    
    // Simulate generation delay
    setTimeout(() => {
      const filename = `${filenamePrefix}_${getTimestamp()}`;
      
      if (format === "JSON") {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        triggerDownload(blob, `${filename}.json`);
      } 
      else if (format === "CSV") {
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          const csvRows = [];
          csvRows.push(headers.join(","));
          
          for (const row of data) {
            const values = headers.map(header => {
              const escaped = ('' + row[header]).replace(/"/g, '\\"');
              return `"${escaped}"`;
            });
            csvRows.push(values.join(","));
          }
          
          const blob = new Blob([csvRows.join("\\n")], { type: "text/csv" });
          triggerDownload(blob, `${filename}.csv`);
        } else {
          // Empty state
          const blob = new Blob(["Nenhum dado disponível"], { type: "text/csv" });
          triggerDownload(blob, `${filename}.csv`);
        }
      }
      else if (format === "PDF") {
        // Mock PDF since we don't have jspdf installed
        // We will trigger window.print() or just a mock blob
        const blob = new Blob(["Simulação de arquivo PDF. Utilize a função de Impressão nativa do navegador para um PDF visual."], { type: "text/plain" });
        triggerDownload(blob, `${filename}_simulado.pdf`);
        setTimeout(() => window.print(), 500);
      }
      
      setExportingFormat(null);
    }, 1500);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">{t("ui_exportar_dados_695")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t("ui_formato_de_arquivo_828")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleExport("CSV")} disabled={exportingFormat !== null}>
          {exportingFormat === "CSV" ? (
            <Check className="mr-2 h-4 w-4 text-emerald-500" />
          ) : (
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
          )}
          <span>{exportingFormat === "CSV" ? "Exportando..." : "Planilha CSV"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport("JSON")} disabled={exportingFormat !== null}>
          {exportingFormat === "JSON" ? (
            <Check className="mr-2 h-4 w-4 text-emerald-500" />
          ) : (
            <FileJson className="mr-2 h-4 w-4 text-amber-500" />
          )}
          <span>{exportingFormat === "JSON" ? "Exportando..." : "Arquivo JSON"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleExport("PDF")} disabled={exportingFormat !== null}>
          {exportingFormat === "PDF" ? (
            <Check className="mr-2 h-4 w-4 text-emerald-500" />
          ) : (
            <FileText className="mr-2 h-4 w-4 text-red-500" />
          )}
          <span>{exportingFormat === "PDF" ? "Exportando..." : "Relatório PDF"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
