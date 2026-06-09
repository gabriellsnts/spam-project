"use client";

import React, { useRef, useState } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CSVImport() {
  const { addLog } = useDomain();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadStatus("error");
      setFileName(file.name);
      addLog(`Falha na importação: O arquivo '${file.name}' não é um CSV válido.`);
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setFileName(file.name);
    addLog(`Início de upload do arquivo de dados: '${file.name}'`);

    // Simula processamento em 1.5s
    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus("success");
      addLog(`Dados importados com sucesso a partir de '${file.name}'. Registros integrados ao modelo.`);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
        id="csv-file-input"
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="bg-green-600 hover:bg-green-500 text-zinc-950 font-bold text-xs gap-2 px-4 py-2 rounded-xl transition shadow-md hover:shadow-green-550/20"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Importar CSV
      </Button>

      {fileName && (
        <div className="text-[10px] flex items-center gap-1 mt-1 font-mono transition-all animate-in fade-in">
          {uploadStatus === "success" && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-semibold">{fileName} processado</span>
            </>
          )}
          {uploadStatus === "error" && (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span className="text-rose-500 font-semibold">{fileName} inválido</span>
            </>
          )}
          {isUploading && (
            <>
              <Loader2 className="h-3.5 w-3.5 text-sky-500 animate-spin" />
              <span className="text-sky-500 font-semibold">Lendo {fileName}...</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
