"use client";

import React, { useState } from "react";
import { Download, FileJson, FileText, FileSpreadsheet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ExportDropdown() {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setExportingFormat(format);
    // Simulate a download delay
    setTimeout(() => {
      setExportingFormat(null);
    }, 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar Dados</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de Arquivo</DropdownMenuLabel>
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
