"use client";

import React, { useRef } from "react";
import { Award, CheckCircle2, Download, ShieldCheck } from "lucide-react";
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
  
  const handleDownload = () => {
    // In a real app, this would use html2canvas or jspdf to generate a PDF of the certificate ref
    alert("Iniciando download do certificado em PDF...");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
          <Award className="h-4 w-4" />
          <span className="hidden sm:inline">Certificado de Qualidade</span>
        </Button>
      </DialogTrigger>
      
      {/* Increased max-w to fit a landscape certificate better */}
      <DialogContent className="sm:max-w-2xl bg-zinc-950 p-1 border-none shadow-2xl">
        <div className="relative bg-white rounded-lg overflow-hidden flex flex-col items-center justify-center p-8 md:p-12 text-center border-8 border-double border-zinc-200">
          
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>
          
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

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
          <div className="z-10 text-zinc-700 max-w-lg space-y-4 font-serif">
            <p className="text-lg">
              Certificamos que o modelo preditivo identificado como
            </p>
            <p className="text-2xl font-bold text-zinc-900 font-mono bg-zinc-100 py-2 px-4 rounded-md inline-block border border-zinc-200">
              {modelId}
            </p>
            <p className="text-lg">
              utilizando o algoritmo <strong className="text-zinc-900">{algorithm}</strong>, 
              foi treinado, validado cruzadamente e aprovado para uso em produção.
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-sm mt-10 z-10">
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">Acurácia</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold text-zinc-800">{(accuracy * 100).toFixed(2)}%</span>
              </div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-lg flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">F1-Score</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xl font-bold text-zinc-800">{(f1Score * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="flex justify-between w-full mt-12 z-10 px-4 md:px-12 items-end">
            <div className="flex flex-col items-center">
              <span className="text-sm font-mono text-zinc-600 mb-1">{new Date(validationDate).toLocaleDateString('pt-BR')}</span>
              <div className="w-32 h-px bg-zinc-400"></div>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Data de Validação</span>
            </div>
            
            {/* Seal */}
            <div className="h-20 w-20 rounded-full border-2 border-emerald-500 flex flex-col items-center justify-center opacity-80 rotate-12">
              <Award className="h-6 w-6 text-emerald-600 mb-0.5" />
              <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-tighter">Certified</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="font-script text-2xl text-zinc-800 mb-[-5px]">AutoML System</span>
              <div className="w-32 h-px bg-zinc-400"></div>
              <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Aprovador Automático</span>
            </div>
          </div>
          
          {/* Action button overlay (outside the certificate visual flow, at the very bottom right) */}
          <div className="absolute bottom-4 right-4 z-20">
             <Button onClick={handleDownload} size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 shadow-lg rounded-full px-4">
                <Download className="h-4 w-4" />
                Baixar PDF
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
