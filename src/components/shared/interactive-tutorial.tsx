"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { X, Pause, Play, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Módulo Risco de Crédito",
    description: "Para começarmos, clique na opção 'Risco de Crédito' no menu lateral para acessar o ambiente analítico.",
    target: "sidebar-credit-risk",
    timeEstimate: "1 min"
  },
  {
    step: 2,
    title: "Importar Dados",
    description: "Excelente! Agora faça o upload de um dataset em formato CSV contendo os dados históricos de crédito para a nossa análise.",
    target: "import-csv",
    timeEstimate: "2 min"
  },
  {
    step: 3,
    title: "Treinar o Modelo",
    description: "Com os dados carregados, clique neste botão para treinar nosso modelo de Machine Learning que fará as predições.",
    target: "train-model",
    timeEstimate: "2 min"
  },
  {
    step: 4,
    title: "Aba de Previsões",
    description: "O modelo está treinado! Clique na aba 'Fazer Previsão' no topo da tela.",
    target: "prediction-tab",
    timeEstimate: "1 min"
  },
  {
    step: 5,
    title: "Gerar Previsão",
    description: "Perfeito! Agora role até o painel simulador, clique no botão para gerar previsão e conclua seu fluxo de aprendizado.",
    target: "generate-prediction",
    timeEstimate: "1 min"
  }
];

export function InteractiveTutorial() {
  const { t, tutorialState, pauseTutorial, resumeTutorial, endTutorial } = useDomain();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const activeStepConfig = TUTORIAL_STEPS.find(s => s.step === tutorialState.currentStep);

  useEffect(() => {
    if (!tutorialState.isActive || tutorialState.isPaused || !activeStepConfig) {
      setTargetRect(null);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(`[data-tutorial-target="${activeStepConfig.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    
    const observer = new MutationObserver(() => updateRect());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [tutorialState.isActive, tutorialState.isPaused, tutorialState.currentStep, activeStepConfig]);

  if (!tutorialState.isActive && !tutorialState.isPaused) {
    return null;
  }

  if (tutorialState.isPaused) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] bg-card/90 backdrop-blur-md border border-primary/30 shadow-2xl rounded-xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom">
        <div>
          <h4 className="font-bold text-sm">{t("ui_tutorial_pausado_244")}</h4>
          <p className="text-xs text-muted-foreground">{t("ui_etapa_58")}{tutorialState.currentStep} de {tutorialState.totalSteps}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={resumeTutorial} className="h-8 gap-2">
            <Play className="h-4 w-4" /> {t("ui_retomar_123")}</Button>
          <Button size="sm" variant="ghost" onClick={endTutorial} className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[9998] pointer-events-none transition-all duration-500 ease-in-out"
        style={{
          background: targetRect 
            ? `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 10}px, rgba(0, 0, 0, 0.75) ${Math.max(targetRect.width, targetRect.height) / 2 + 30}px)`
            : 'rgba(0,0,0,0.75)'
        }}
      />

      <div 
        className="fixed z-[9999] bg-card text-card-foreground shadow-2xl rounded-2xl border border-primary/20 w-80 overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          ...(targetRect ? {
            top: targetRect.bottom + 20 > window.innerHeight - 200 ? targetRect.top - 200 : targetRect.bottom + 20,
            left: Math.min(Math.max(20, targetRect.left + targetRect.width / 2 - 160), window.innerWidth - 340)
          } : {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          })
        }}
      >
        <div className="h-1.5 w-full bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(tutorialState.currentStep / tutorialState.totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
              <span className="bg-primary/10 px-2 py-0.5 rounded-full">
                {t("ui_etapa_403")}{tutorialState.currentStep} de {tutorialState.totalSteps}
              </span>
              {activeStepConfig && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  ~{activeStepConfig.timeEstimate}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full -mr-2 -mt-2 opacity-50 hover:opacity-100 text-destructive" onClick={endTutorial}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <h3 className="font-bold text-lg mb-2 leading-tight">
            {activeStepConfig?.title || "Carregando..."}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            {activeStepConfig?.description || "Aguardando navegação..."}
          </p>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={pauseTutorial} className="text-xs h-8 text-muted-foreground">
              <Pause className="h-3 w-3 mr-1.5" />
              {t("ui_pausar_320")}</Button>
            
            <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
              {t("ui_fa_a_a_a_235")}<ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
