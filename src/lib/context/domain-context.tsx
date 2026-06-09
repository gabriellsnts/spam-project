"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

interface User {
  username: string;
  profileName: string;
}

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
  // Auth fields:
  currentUser: User | null;
  isAuthLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: (reason?: string) => void;
  resetAttempts: (username: string) => void;
  isUserLocked: (username: string) => boolean;
}

const DomainContext = createContext<DomainContextProps | undefined>(undefined);

// Helper function to hash password client-side (CA05)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const userProfile = currentUser ? currentUser.profileName : "Visitante";

  // Carregar tema e sessão do localStorage/sessionStorage no cliente
  useEffect(() => {
    const savedTheme = localStorage.getItem("spam-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    const savedUser = sessionStorage.getItem("spam-user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Erro ao carregar usuário salvo:", e);
      }
    }
    setIsAuthLoading(false);
  }, []);

  // Carregar logs do localStorage na inicialização
  useEffect(() => {
    const storedLogs = localStorage.getItem("spam-audit-logs");
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error("Erro ao carregar logs de auditoria:", e);
      }
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

  // Função auxiliar para registrar logs de auditoria com um perfil customizado (CA06)
  const addLogWithProfile = useCallback((profile: string, action: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      profile,
      timestamp: Date.now(),
      action,
    };
    setLogs((prev) => {
      const next = [newLog, ...prev];
      localStorage.setItem("spam-audit-logs", JSON.stringify(next));
      return next;
    });
  }, []);

  const addLog = useCallback((action: string) => {
    addLogWithProfile(userProfile, action);
  }, [userProfile, addLogWithProfile]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      const logMsg = `Tema alterado para modo ${next === "dark" ? "escuro" : "claro"}`;
      addLogWithProfile(userProfile, logMsg);
      return next;
    });
  };

  const isUserLocked = useCallback((username: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    return localStorage.getItem(`spam-locked-${cleanUsername}`) === "true";
  }, []);

  const resetAttempts = useCallback((username: string) => {
    const cleanUsername = username.trim().toLowerCase();
    localStorage.removeItem(`spam-locked-${cleanUsername}`);
    localStorage.removeItem(`spam-attempts-${cleanUsername}`);
    addLogWithProfile("Sistema", `Conta do usuário '${username}' foi reativada/desbloqueada pelo administrador.`);
  }, [addLogWithProfile]);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = username.trim().toLowerCase();
    
    if (isUserLocked(cleanUsername)) {
      const logMsg = `Tentativa de login bloqueada para o usuário '${username}' - Conta suspensa por excesso de tentativas.`;
      addLogWithProfile("Sistema", logMsg);
      return {
        success: false,
        message: "Esta conta está temporariamente bloqueada devido a excesso de tentativas de login malsucedidas. Por favor, entre em contato com o administrador para reativação da conta.",
      };
    }

    // Hash das senhas pré-cadastradas para conformidade com CA05
    const USERS_DB: Record<string, { profileName: string; passwordHash: string }> = {
      admin: {
        profileName: "Administrador",
        passwordHash: "2407891877f24823292418e202598379469796e6257e8d35661f00880155b9e0", // admin123
      },
      gestor: {
        profileName: "Gestor de Operações",
        passwordHash: "5be7970d4bde55cd91a1a742c366ff852a420b9df4cc0ec12b32938565b91b9a", // spam2026
      },
    };

    const user = USERS_DB[cleanUsername];
    const passwordHash = await sha256(password);
    
    if (user && user.passwordHash === passwordHash) {
      const loggedUser = { username: cleanUsername, profileName: user.profileName };
      setCurrentUser(loggedUser);
      sessionStorage.setItem("spam-user", JSON.stringify(loggedUser));
      
      localStorage.removeItem(`spam-attempts-${cleanUsername}`);
      
      const logMsg = `Login efetuado com sucesso para o usuário '${username}'.`;
      addLogWithProfile(user.profileName, logMsg);

      return { success: true, message: "Login realizado com sucesso." };
    } else {
      const attemptsKey = `spam-attempts-${cleanUsername}`;
      const currentAttempts = parseInt(localStorage.getItem(attemptsKey) || "0", 10) + 1;
      localStorage.setItem(attemptsKey, currentAttempts.toString());
      
      let message = "Usuário ou senha incorretos.";
      let isBlockedNow = false;

      if (currentAttempts >= 5) {
        localStorage.setItem(`spam-locked-${cleanUsername}`, "true");
        isBlockedNow = true;
        message = "Esta conta foi bloqueada devido a excesso de tentativas. Por favor, entre em contato com o administrador para reativação da conta.";
      }

      const logMsg = `Tentativa de login malsucedida para o usuário '${username}'. Resultado: Credenciais inválidas (Tentativa ${currentAttempts}/5).${isBlockedNow ? ' Conta bloqueada.' : ''}`;
      addLogWithProfile("Sistema", logMsg);

      return { success: false, message };
    }
  }, [isUserLocked, addLogWithProfile]);

  const logout = useCallback((reason?: string) => {
    const oldProfile = currentUser ? currentUser.profileName : "Visitante";
    setCurrentUser(null);
    sessionStorage.removeItem("spam-user");
    
    let logMsg = `Sessão encerrada pelo usuário.`;
    if (reason === "inactivity") {
      logMsg = `Sessão encerrada automaticamente por inatividade.`;
    }
    
    addLogWithProfile(oldProfile, logMsg);
    
    if (reason === "inactivity") {
      router.push("/login?reason=inactivity");
    } else {
      router.push("/login");
    }
  }, [currentUser, router, addLogWithProfile]);

  // Temporizador de Inatividade (CA04)
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const testTimeout = localStorage.getItem("spam-inactivity-test-time");
      const timeoutMs = testTimeout ? parseInt(testTimeout, 10) : 30 * 60 * 1000; // 30 mins (1800000ms)
      
      timeoutId = setTimeout(() => {
        logout("inactivity");
      }, timeoutMs);
    };

    const activityEvents = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetInactivityTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [currentUser, logout]);

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

  const startLoadingTransition = (domain: DomainType) => {
    setIsTransitioning(true);
    setTargetDomain(domain);
    addLog(`Início de carregamento do módulo: ${DOMAINS[domain].name}`);

    setTimeout(() => {
      setActiveDomain(domain);
      setIsTransitioning(false);
      setTargetDomain(null);
      addLog(`Módulo ${DOMAINS[domain].name} carregado com sucesso. Parâmetros sincronizados.`);
      router.push(`/${domain}`);
    }, 1200);
  };

  const initiateDomainSwitch = (domain: DomainType) => {
    if (!activeDomain) {
      startLoadingTransition(domain);
      return;
    }

    if (activeDomain === domain) {
      router.push(`/${domain}`);
      return;
    }

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
    localStorage.removeItem("spam-audit-logs");
    addLogWithProfile(userProfile, "Histórico de logs de auditoria limpo manualmente.");
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
        // Auth value:
        currentUser,
        isAuthLoading,
        login,
        logout,
        resetAttempts,
        isUserLocked,
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
