"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface AuditLog {
  id: string;
  profile: string;
  timestamp: number;
  action: string;
}

export type DomainType = "maintenance" | "demand" | "churn" | "credit-risk";

export interface DomainMetadata {
  id: DomainType;
  name: string;
  description: string;
  color: string;
  accentClass: string;
  bgGradient: string;
  borderGlow: string;
  iconName: string;
}

export const DOMAINS: Record<DomainType, DomainMetadata> = {
  "maintenance": {
    id: "maintenance",
    name: "Manutenção de Equipamentos",
    description: "Análise preditiva de falhas em máquinas, ciclos de vida útil e cronograma de manutenção preventiva baseada em sensores.",
    color: "amber",
    accentClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    bgGradient: "from-amber-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    iconName: "Wrench",
  },
  "demand": {
    id: "demand",
    name: "Previsão de Demanda",
    description: "Modelagem de séries temporais para projeção de vendas, estoques e sazonalidades com inteligência estatística.",
    color: "sky",
    accentClass: "text-sky-500 bg-sky-500/10 border-sky-500/30",
    bgGradient: "from-sky-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-sky-500/50 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]",
    iconName: "TrendingUp",
  },
  "churn": {
    id: "churn",
    name: "Retenção de Clientes",
    description: "Identificação de padrões de cancelamento, score de risco de rotatividade de clientes e ações de engajamento direcionadas.",
    color: "violet",
    accentClass: "text-violet-500 bg-violet-500/10 border-violet-500/30",
    bgGradient: "from-violet-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-violet-500/50 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    iconName: "Users",
  },
  "credit-risk": {
    id: "credit-risk",
    name: "Risco de Crédito",
    description: "Avaliação de risco de crédito de clientes, score de adimplência e análise de probabilidade de inadimplência.",
    color: "emerald",
    accentClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
    bgGradient: "from-emerald-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    iconName: "ShieldAlert",
  },
};

interface DomainContextProps {
  activeDomain: DomainType | null;
  logs: AuditLog[];
  isTransitioning: boolean;
  targetDomain: DomainType | null;
  confirmSwitchOpen: boolean;
  pendingDomain: DomainType | null;
  userProfile: string;
  theme: "light" | "dark";
  toggleTheme: () => void;
  initiateDomainSwitch: (domain: DomainType) => void;
  confirmDomainSwitch: () => void;
  cancelDomainSwitch: () => void;
  addLog: (action: string) => void;
  clearLogs: () => void;
}

const DomainContext = createContext<DomainContextProps | undefined>(undefined);

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeDomain, setActiveDomain] = useState<DomainType | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetDomain, setTargetDomain] = useState<DomainType | null>(null);
  const [confirmSwitchOpen, setConfirmSwitchOpen] = useState(false);
  const [pendingDomain, setPendingDomain] = useState<DomainType | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Efeito para carregar o tema do localStorage no cliente
  useEffect(() => {
    const savedTheme = localStorage.getItem("spam-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Efeito para aplicar a classe no elemento html
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("spam-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      // Logar a mudança de tema
      const logMsg = `Tema alterado para modo ${next === "dark" ? "escuro" : "claro"}`;
      const newLog: AuditLog = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        profile: userProfile,
        timestamp: Date.now(),
        action: logMsg,
      };
      setLogs((prevLogs) => [newLog, ...prevLogs]);
      return next;
    });
  };

  const userProfile = "Gestor de Operações";

  // Sincronizar o domínio ativo baseado na URL na inicialização ou reload
  useEffect(() => {
    const segments = pathname.split("/");
    const activeSegment = segments[segments.length - 1] as DomainType;
    if (activeSegment && DOMAINS[activeSegment]) {
      setActiveDomain(activeSegment);
    } else if (pathname === "/") {
      setActiveDomain(null);
    }
  }, [pathname]);

  const addLog = (action: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      profile: userProfile,
      timestamp: Date.now(),
      action,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const startLoadingTransition = (domain: DomainType) => {
    setIsTransitioning(true);
    setTargetDomain(domain);
    addLog(`Início de carregamento do módulo: ${DOMAINS[domain].name}`);

    // Simula o carregamento das bibliotecas e parâmetros em 1.2 segundos (CA02)
    setTimeout(() => {
      setActiveDomain(domain);
      setIsTransitioning(false);
      setTargetDomain(null);
      addLog(`Módulo ${DOMAINS[domain].name} carregado com sucesso. Parâmetros sincronizados.`);
      router.push(`/${domain}`);
    }, 1200);
  };

  const initiateDomainSwitch = (domain: DomainType) => {
    // Se não há domínio ativo ou se é o mesmo domínio, carrega diretamente
    if (!activeDomain) {
      startLoadingTransition(domain);
      return;
    }

    if (activeDomain === domain) {
      // Já está no domínio, só redireciona
      router.push(`/${domain}`);
      return;
    }

    // Se há outro domínio ativo, exige confirmação (CA06)
    setPendingDomain(domain);
    setConfirmSwitchOpen(true);
    addLog(`Solicitada alternância de domínio de '${DOMAINS[activeDomain].name}' para '${DOMAINS[domain].name}'`);
  };

  const confirmDomainSwitch = () => {
    if (!pendingDomain) return;

    addLog("Confirmação de limpeza de memória volátil recebida pelo usuário.");
    addLog(`Reset de contexto executado. Limpeza de dados temporários de '${DOMAINS[activeDomain!].name}' efetuada.`);
    
    const domainToLoad = pendingDomain;
    setConfirmSwitchOpen(false);
    setPendingDomain(null);

    // Inicia a transição para o novo domínio a partir de um estado limpo
    startLoadingTransition(domainToLoad);
  };

  const cancelDomainSwitch = () => {
    if (!pendingDomain) return;
    addLog(`Troca de domínio cancelada pelo usuário. Mantido contexto em '${DOMAINS[activeDomain!].name}'.`);
    setConfirmSwitchOpen(false);
    setPendingDomain(null);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Histórico de logs de auditoria limpo manualmente.");
  };

  return (
    <DomainContext.Provider
      value={{
        activeDomain,
        logs,
        isTransitioning,
        targetDomain,
        confirmSwitchOpen,
        pendingDomain,
        userProfile,
        theme,
        toggleTheme,
        initiateDomainSwitch,
        confirmDomainSwitch,
        cancelDomainSwitch,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </DomainContext.Provider>
  );
}

export function useDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error("useDomain deve ser usado dentro de um DomainProvider");
  }
  return context;
}
