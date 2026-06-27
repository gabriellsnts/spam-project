"use client";

import React, { useState, useEffect } from "react";
import { Award, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ModelCertificateProps {
  modelId: string;
  algorithm: string;
  accuracy: number;
  f1Score: number;
  validationDate: string;
}

export function ModelCertificateDialog({ 
  modelId, 
  algorithm, 
  accuracy, 
  f1Score, 
  validationDate 
}: ModelCertificateProps) {
  
  // CA03: Hash gerado dinamicamente para o certificado (mock)
  const [certHash, setCertHash] = useState("");

  useEffect(() => {
    // Generate a pseudo-random hash based on modelId and validationDate
    const generateHash = async () => {
      const str = `${modelId}-${validationDate}-${algorithm}`;
      const msgBuffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
      setCertHash(hashHex.toUpperCase());
    };
    generateHash();
  }, [modelId, validationDate, algorithm]);
  
  // CA06: Imprimir / Baixar (window.print invocará a UI nativa de PDF do OS)
  const handlePrint = () => {
    // A little trick to trigger browser print without showing the rest of the page:
    // Normally we'd use a @media print CSS rule. Since we are using Tailwind,
    // we can rely on classes like `print:hidden` to hide background elements.
    // Assuming our main layout has `print:hidden` where appropriate, or we just
    // invoke the native print dialog.
    window.print();
  };

  // CA01: Button is only usable because it is conditionally rendered in the parent page
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
          <Award className="h-4 w-4" />
          <span className="hidden sm:inline">Certificado de Qualidade</span>
        </Button>
      </DialogTrigger>
      
      {/* CA02: Premium Layout Dialog */}
      <DialogContent className="sm:max-w-3xl bg-zinc-950 p-1 border-none shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm] print:p-0 print:bg-white overflow-hidden">
        
        {/* CERTIFICATE WRAPPER - This is the part that will be printed beautifully */}
        <div 
          id="certificate-print-area" 
          className="relative bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center p-8 md:p-12 text-center border-8 border-double border-zinc-200 min-h-[500px]"
        >
          
          {/* Decorative background elements (CA02) */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>
          
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none print:hidden"></div>

          {/* Certificate Header */}
          <div className="mb-6 flex flex-col items-center z-10">
            <div className="h-16 w-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-zinc-900 tracking-wider">CERTIFICADO DE QUALIDADE</h2>
            <p className="text-zinc-500 uppercase tracking-widest text-xs mt-2 font-semibold">Plataforma Preditiva Antigravity</p>
          </div>

          <div className="w-24 h-px bg-zinc-300 mb-8 z-10"></div>

          {/* Certificate Body */}
          <div className="z-10 text-zinc-700 max-w-lg space-y-4 font-serif leading-relaxed">
            <p className="text-lg">
              Certificamos que o modelo preditivo identificado como
            </p>
            <p className="text-2xl font-bold text-zinc-900 font-mono bg-zinc-100 py-2 px-4 rounded-md inline-block border border-zinc-200 shadow-sm">
              {modelId}
            </p>
            <p className="text-lg">
              utilizando o algoritmo <strong className="text-zinc-900">{algorithm}</strong>, 
              foi treinado, validado rigorosamente em cross-validation e aprovado para operação contínua.
            </p>
          </div>

          {/* Metrics (CA04) */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-sm mt-8 z-10">
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg flex flex-col items-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">Acurácia</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold text-zinc-800">{(accuracy * 100).toFixed(2)}%</span>
              </div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg flex flex-col items-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">F1-Score</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold text-zinc-800">{(f1Score * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures (CA05) */}
          <div className="flex justify-between w-full mt-12 z-10 px-4 md:px-12 items-end">
            <div className="flex flex-col items-center">
              <span className="text-sm font-mono text-zinc-600 mb-1 font-bold">
                {new Date(validationDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <div className="w-32 h-px bg-zinc-400"></div>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Data de Validação</span>
            </div>
            
            {/* Seal */}
            <div className="h-20 w-20 rounded-full border-2 border-emerald-500 flex flex-col items-center justify-center opacity-90 rotate-12 bg-white shadow-sm">
              <Award className="h-6 w-6 text-emerald-600 mb-0.5" />
              <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-tighter">Verified</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-script text-2xl text-zinc-800 mb-[-5px]" style={{ fontFamily: 'cursive' }}>Antigravity Engine</span>
              <div className="w-32 h-px bg-zinc-400"></div>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Auditor Automático</span>
            </div>
          </div>

          {/* Hash Watermark (CA03) */}
          <div className="absolute bottom-2 left-4 text-[9px] font-mono text-zinc-400 z-10">
            Hash: {certHash}
          </div>
        </div>
        
        {/* Action button overlay (outside the certificate visual flow, at the very bottom right) - Hidden when printing */}
        <div className="absolute bottom-4 right-4 z-20 print:hidden">
           <Button onClick={handlePrint} size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 shadow-lg rounded-full px-4">
              <Printer className="h-4 w-4" />
              Imprimir PDF
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
