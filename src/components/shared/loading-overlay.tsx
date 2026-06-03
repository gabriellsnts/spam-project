"use client";

import React, { useEffect, useState } from "react";
import { useDomain, DOMAINS } from "@/lib/context/domain-context";
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  const { isTransitioning, targetDomain } = useDomain();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando...");

  const domainInfo = targetDomain ? DOMAINS[targetDomain] : null;

  useEffect(() => {
    if (!isTransitioning) {
      setProgress(0);
      return;
    }

    // Progresso simulado de 1.2 segundos
    const duration = 1200;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const phrases = [
      "Alocando memória volátil...",
      "Carregando bibliotecas analíticas...",
      "Conectando a fontes de dados distribuídas...",
      "Carregando pesos dos modelos preditivos...",
      "Sincronizando parâmetros do domínio...",
      "Finalizando inicialização...",
    ];

    const timer = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(nextProgress);

      // Mudar a frase baseando-se no progresso
      const phraseIndex = Math.min(
        Math.floor((nextProgress / 100) * phrases.length),
        phrases.length - 1
      );
      
      if (domainInfo) {
        setStatusText(`${phrases[phraseIndex]} (${domainInfo.name})`);
      } else {
        setStatusText(phrases[phraseIndex]);
      }

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isTransitioning, targetDomain, domainInfo]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="w-full max-w-md p-8 mx-4 rounded-2xl bg-card/90 border border-border shadow-[0_0_50px_rgba(0,0,0,0.15)] text-center relative overflow-hidden">
        {/* Glow de fundo correspondente ao domínio que está sendo carregado */}
        {domainInfo && (
          <div
            className={`absolute -inset-10 opacity-10 bg-gradient-to-tr ${
              domainInfo.id === "maintenance"
                ? "from-red-500/30"
                : domainInfo.id === "demand"
                ? "from-emerald-500/30"
                : domainInfo.id === "churn"
                ? "from-violet-500/30"
                : "from-blue-500/30"
            } to-transparent blur-2xl rounded-full`}
          />
        )}

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <Loader2 className={`h-12 w-12 animate-spin ${
              domainInfo?.id === "maintenance"
                ? "text-red-500"
                : domainInfo?.id === "demand"
                ? "text-emerald-500"
                : domainInfo?.id === "churn"
                ? "text-violet-500"
                : domainInfo?.id === "credit-risk"
                ? "text-blue-500"
                : "text-green-500"
            }`} />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            Carregando Módulo Preditivo
          </h3>
          
          <p className="text-xs text-muted-foreground min-h-[32px] max-w-[280px] mb-6 flex items-center justify-center">
            {statusText}
          </p>

          {/* Barra de Progresso */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className={`h-full transition-all duration-75 ease-out rounded-full ${
                domainInfo?.id === "maintenance"
                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  : domainInfo?.id === "demand"
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  : domainInfo?.id === "churn"
                  ? "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <span className="text-[10px] text-muted-foreground/60 font-mono mt-2">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
