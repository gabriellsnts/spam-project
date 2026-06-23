"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface AuditLog {
  id: string;
  profile: string;
  username: string;
  accessProfile: string;
  timestamp: number;
  action: string;
}

export interface Alert {
  id: string;
  domain: DomainType;
  item: string;
  value: string | number;
  metric: string;
  criticality: "medium" | "high";
  timestamp: number;
  recognized: boolean;
}

export interface PredictionHistoryRecord {
  id: string;
  domain: DomainType;
  timestamp: number;
  item: string;
  predictionResult: string;
  details?: Record<string, string | number | boolean>;
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

export interface DashboardActivity {
  id: string;
  description: string;
  timestamp: string;
  type: "training" | "alert" | "prediction" | "system";
}

export interface DomainStatus {
  isModelTrained: boolean;
  activeAlertsCount: number;
  lastPredictionDate: string | null;
  recentActivities: DashboardActivity[];
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  message: string;
}

export interface User {
  username: string;
  profileName: string;
  fullName: string;
  accessProfile: string;
  department: string;
  lastLogin: string;
  status: "ativo" | "inativo";
  passwordHash?: string;
  theme?: "light" | "dark" | "auto";
}

export interface TrainedModel {
  modelId: string;
  domain: DomainType;
  algorithm: string;
  type: "Classification" | "Regression";
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    aucRoc?: number;
    rmse?: number;
    r2?: number;
    mae?: number;
  };
  hyperparameters: Record<string, string | number | boolean>;
  trainSize: number;
  testSize: number;
  timestamp: number;
  confusionMatrix?: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
  residuals?: {
    id: number;
    predicted: number;
    residual: number;
    real: number;
  }[];
}

export interface RetrainingCycle {
  modelId: string;
  timestamp: number;
  algorithm: string;
  hyperparameters: Record<string, string | number | boolean>;
  metrics: TrainedModel["metrics"];
  trainSize: number;
  testSize: number;
}

interface DomainContextProps {
  activeDomain: DomainType | null;
  logs: AuditLog[];
  isTransitioning: boolean;
  targetDomain: DomainType | null;
  confirmSwitchOpen: boolean;
  pendingDomain: DomainType | null;
  userProfile: string;
  theme: "light" | "dark" | "auto";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;
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
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  // Training fields:
  isTraining: boolean;
  trainingProgress: number;
  trainingStep: string;
  trainingETA: number;
  trainingDuration: number;
  trainingError: string | null;
  trainingErrorDetails: string | null;
  showTrainingDetails: boolean;
  trainingFinishedAlert: boolean;
  simulatedFail: boolean;
  setSimulatedFail: (val: boolean) => void;
  startTraining: (fileSize: number, rowCount: number, _rowsData?: string[][]) => void;
  resetTraining: () => void;
  dismissFinishedAlert: () => void;
  toggleTrainingDetails: () => void;
  // Dashboard fields:
  dashboardStatus: Record<DomainType, DomainStatus>;
  systemHealth: SystemHealth;
  simulateDashboardEvent: () => void;
  trainedModels: Record<DomainType, TrainedModel | null>;
  previousTrainedModels: Record<DomainType, TrainedModel | null>;
  hyperparameterHistory: Record<DomainType, RetrainingCycle[]>;
  clearHyperparameterHistory: (domain: DomainType) => void;
  alertThresholds: Record<DomainType, number>;
  updateAlertThreshold: (domain: DomainType, value: number) => void;
  resetAlertThreshold: (domain: DomainType) => void;
  updateDashboardAlertCount: (domain: DomainType, count: number) => void;
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id" | "timestamp" | "recognized">) => void;
  recognizeAlert: (id: string) => void;
  clearAlerts: () => void;
  activeUtilityPanel: "alerts" | "logs" | "predictions" | "menu" | null;
  setActiveUtilityPanel: (panel: "alerts" | "logs" | "predictions" | "menu" | null) => void;
  predictionHistory: PredictionHistoryRecord[];
  addPredictionToHistory: (record: Omit<PredictionHistoryRecord, "id" | "timestamp">) => void;
  clearPredictionHistory: () => void;
  domainFilter: DomainType | "all";
  setDomainFilter: (filter: DomainType | "all") => void;
  periodFilter: "all" | "24h" | "7d" | "30d";
  setPeriodFilter: (filter: "all" | "24h" | "7d" | "30d") => void;
}

const DomainContext = createContext<DomainContextProps | undefined>(undefined);

// Helper function to hash password client-side (CA05)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const DEFAULT_USERS: User[] = [
  {
    username: "admin",
    profileName: "Administrador",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // admin123
    fullName: "Administrador do Sistema",
    accessProfile: "Super Admin",
    department: "TI & Infraestrutura",
    lastLogin: new Date().toISOString(),
    status: "ativo",
  },
  {
    username: "gestor",
    profileName: "Gestor de Operações",
    passwordHash: "db05065fff4dff901e0cf548ee0a478770a3074516026ff01021a3c0a7a917a4", // spam2026
    fullName: "João Silva",
    accessProfile: "Gestor Analítico",
    department: "Operações",
    lastLogin: new Date().toISOString(),
    status: "ativo",
  },
];

const MOCK_LOGS: AuditLog[] = [
  {
    id: "LOG01",
    profile: "Administrador",
    username: "Administrador do Sistema",
    accessProfile: "Super Admin",
    timestamp: Date.now() - 30 * 60 * 1000,
    action: "Login efetuado com sucesso para o usuário 'admin'."
  },
  {
    id: "LOG02",
    profile: "Administrador",
    username: "Administrador do Sistema",
    accessProfile: "Super Admin",
    timestamp: Date.now() - 1 * 3600000,
    action: "[Alert Configuration] Limiar de alerta do domínio 'Manutenção de Equipamentos' alterado para 35%."
  },
  {
    id: "LOG03",
    profile: "Sistema",
    username: "Sistema",
    accessProfile: "Sistema",
    timestamp: Date.now() - 2 * 3600000,
    action: "[Alert Triggered] Novo alerta preditivo (Alto) no domínio 'Retenção de Clientes': Indústrias Metalúrgicas Alfa (C104) - Valor: 87%."
  },
  {
    id: "LOG04",
    profile: "Gestor de Operações",
    username: "João Silva",
    accessProfile: "Gestor Analítico",
    timestamp: Date.now() - 3 * 3600000,
    action: "Login efetuado com sucesso para o usuário 'gestor'."
  },
  {
    id: "LOG05",
    profile: "Gestor de Operações",
    username: "João Silva",
    accessProfile: "Gestor Analítico",
    timestamp: Date.now() - 4 * 3600000,
    action: "[Alert Recognized] Alerta no domínio 'Previsão de Demanda' (Cabos Elétricos de Cobre) marcado como reconhecido."
  },
  {
    id: "LOG06",
    profile: "Sistema",
    username: "Sistema",
    accessProfile: "Sistema",
    timestamp: Date.now() - 5 * 3600000,
    action: "[Model Training Success] Treinamento do modelo para o módulo 'Previsão de Demanda' concluído com sucesso. ID: SPAM-MODEL-REG-DMD3094, Algoritmo: Prophet Time-Series Regressor."
  },
  {
    id: "LOG07",
    profile: "Sistema",
    username: "Sistema",
    accessProfile: "Sistema",
    timestamp: Date.now() - 8 * 3600000,
    action: "[Model Training Error] Falha de volume de dados no módulo 'Risco de Crédito': apenas 8 registros fornecidos (mínimo de 10 exigido)."
  },
  {
    id: "LOG08",
    profile: "Administrador",
    username: "Administrador do Sistema",
    accessProfile: "Super Admin",
    timestamp: Date.now() - 24 * 3600000,
    action: "Cadastro do novo usuário gestor 'João Silva' realizado com sucesso."
  },
  {
    id: "LOG09",
    profile: "Sistema",
    username: "Sistema",
    accessProfile: "Sistema",
    timestamp: Date.now() - 25 * 3600000,
    action: "Tentativa de login malsucedida para o usuário 'gestor'. Resultado: Credenciais inválidas (Tentativa 1/5)."
  },
  {
    id: "LOG10",
    profile: "Administrador",
    username: "Administrador do Sistema",
    accessProfile: "Super Admin",
    timestamp: Date.now() - 48 * 3600000,
    action: "Histórico de logs de auditoria limpo manualmente."
  }
];

const DEFAULT_THRESHOLDS: Record<DomainType, number> = {
  maintenance: 30,
  demand: 15,
  churn: 80,
  "credit-risk": 60
};

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeDomain, setActiveDomain] = useState<DomainType | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetDomain, setTargetDomain] = useState<DomainType | null>(null);
  const [confirmSwitchOpen, setConfirmSwitchOpen] = useState(false);
  const [pendingDomain, setPendingDomain] = useState<DomainType | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark" | "auto">("dark");
  const [alertThresholds, setAlertThresholds] = useState<Record<DomainType, number>>(DEFAULT_THRESHOLDS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<"alerts" | "logs" | "predictions" | "menu" | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryRecord[]>([]);
  const [domainFilter, setDomainFilter] = useState<DomainType | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "24h" | "7d" | "30d">("all");
  const isAlertsInitialized = useRef(false);
  const isPredictionHistoryInitialized = useRef(false);

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  const userProfile = currentUser ? currentUser.profileName : "Visitante";

  // Training states
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingStep, setTrainingStep] = useState("");
  const [trainingETA, setTrainingETA] = useState(0);
  const [trainingDuration, setTrainingDuration] = useState(0);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [trainingErrorDetails, setTrainingErrorDetails] = useState<string | null>(null);
  const [showTrainingDetails, setShowTrainingDetails] = useState(false);
  const [trainingFinishedAlert, setTrainingFinishedAlert] = useState(false);
  const [simulatedFail, setSimulatedFail] = useState(false);

  // Dashboard states (RF27)
  const [dashboardStatus, setDashboardStatus] = useState<Record<DomainType, DomainStatus>>({
    "maintenance": {
      isModelTrained: true,
      activeAlertsCount: 3,
      lastPredictionDate: new Date().toISOString(),
      recentActivities: [
        { id: "1", description: "Alerta de vibração anômala no Motor B-12", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "alert" },
        { id: "2", description: "Novo modelo preditivo treinado", timestamp: new Date(Date.now() - 86400000).toISOString(), type: "training" },
      ]
    },
    "demand": {
      isModelTrained: false,
      activeAlertsCount: 0,
      lastPredictionDate: null,
      recentActivities: [
        { id: "3", description: "Dados de sazonalidade importados", timestamp: new Date(Date.now() - 172800000).toISOString(), type: "system" }
      ]
    },
    "churn": {
      isModelTrained: true,
      activeAlertsCount: 12,
      lastPredictionDate: new Date(Date.now() - 7200000).toISOString(),
      recentActivities: [
        { id: "4", description: "Previsão de rotatividade gerada", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "prediction" },
        { id: "5", description: "Alerta de risco crítico - Cliente VIP", timestamp: new Date(Date.now() - 14400000).toISOString(), type: "alert" }
      ]
    },
    "credit-risk": {
      isModelTrained: true,
      activeAlertsCount: 0,
      lastPredictionDate: new Date(Date.now() - 43200000).toISOString(),
      recentActivities: [
        { id: "6", description: "Reavaliação de score da base completa", timestamp: new Date(Date.now() - 43200000).toISOString(), type: "prediction" }
      ]
    }
  });

  // Model states per domain (CA03)
  const [trainedModels, setTrainedModels] = useState<Record<DomainType, TrainedModel | null>>({
    maintenance: null,
    demand: null,
    churn: null,
    "credit-risk": null
  });

  // Track previous session model for comparison (RF12 - CA05)
  const [previousTrainedModels, setPreviousTrainedModels] = useState<Record<DomainType, TrainedModel | null>>({
    maintenance: null,
    demand: null,
    churn: null,
    "credit-risk": null
  });

  // Track history of hyperparameters of retraining cycles (CA06)
  const [hyperparameterHistory, setHyperparameterHistory] = useState<Record<DomainType, RetrainingCycle[]>>({
    maintenance: [],
    demand: [],
    churn: [],
    "credit-risk": []
  });

  const archiveRetrainingCycle = useCallback((domain: DomainType, cycle: RetrainingCycle) => {
    setHyperparameterHistory(prev => {
      const currentList = prev[domain] || [];
      const updatedList = [cycle, ...currentList];
      const nextHistory = {
        ...prev,
        [domain]: updatedList
      };
      localStorage.setItem("spam-hyperparameter-history", JSON.stringify(nextHistory));
      return nextHistory;
    });
  }, []);

  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "warning",
    message: "15 alertas ativos em 2 domínios requerem atenção."
  });

  // Carregar tema e sessão do localStorage/sessionStorage no cliente
  useEffect(() => {
    const savedUser = sessionStorage.getItem("spam-user");
    let initialUser: User | null = null;
    if (savedUser) {
      try {
        initialUser = JSON.parse(savedUser);
        setCurrentUser(initialUser);
      } catch (e) {
        console.error("Erro ao carregar usuário salvo:", e);
      }
    }

    const savedTheme = localStorage.getItem("spam-theme") as "light" | "dark" | "auto" | null;
    const userTheme = initialUser?.theme;
    
    // Prioridade: Tema do usuário logado -> Tema salvo no localStorage -> Padrão (dark)
    const finalTheme = userTheme || savedTheme || "dark";
    setThemeState(finalTheme);

    const savedUsers = localStorage.getItem("spam-users");
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error("Erro ao carregar usuários salvos:", e);
        setUsers(DEFAULT_USERS);
      }
    } else {
      setUsers(DEFAULT_USERS);
      localStorage.setItem("spam-users", JSON.stringify(DEFAULT_USERS));
    }

    const savedHistory = localStorage.getItem("spam-hyperparameter-history");
    if (savedHistory) {
      try {
        setHyperparameterHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico de hiperparâmetros:", e);
      }
    }

    const savedThresholds = localStorage.getItem("spam-alert-thresholds");
    if (savedThresholds) {
      try {
        setAlerts(JSON.parse(localStorage.getItem("spam-alerts") || "[]"));
        setAlertThresholds(JSON.parse(savedThresholds));
      } catch (e) {
        console.error("Erro ao carregar limiares de alerta:", e);
      }
    }

    const savedAlerts = localStorage.getItem("spam-alerts");
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) {
        console.error("Erro ao carregar alertas:", e);
      }
    } else {
      const initialAlerts: Alert[] = [
        {
          id: "ALT-MNT-1",
          domain: "maintenance",
          item: "Prensa Hidráulica 04 (M04)",
          value: "Vibração: 4.8 mm/s, Temp: 78°C",
          metric: "Telemetria Física",
          criticality: "medium",
          timestamp: Date.now() - 3 * 3600000,
          recognized: false
        },
        {
          id: "ALT-MNT-2",
          domain: "maintenance",
          item: "Torno CNC 01 (M01)",
          value: "Temperatura: 82°C",
          metric: "Telemetria Física",
          criticality: "high",
          timestamp: Date.now() - 5 * 3600000,
          recognized: false
        },
        {
          id: "ALT-MNT-3",
          domain: "maintenance",
          item: "Braço Robotizado A (M02)",
          value: "OEE: 74%",
          metric: "Eficiência OEE",
          criticality: "medium",
          timestamp: Date.now() - 12 * 3600000,
          recognized: false
        },
        {
          id: "ALT-CHN-1",
          domain: "churn",
          item: "Indústrias Metalúrgicas Alfa (C104)",
          value: "87%",
          metric: "Churn Score",
          criticality: "high",
          timestamp: Date.now() - 1 * 3600000,
          recognized: false
        },
        {
          id: "ALT-CHN-2",
          domain: "churn",
          item: "Supermercados Ideal (C302)",
          value: "72%",
          metric: "Churn Score",
          criticality: "medium",
          timestamp: Date.now() - 2 * 3600000,
          recognized: false
        },
        {
          id: "ALT-CHN-3",
          domain: "churn",
          item: "Logística Expressa S.A. (C098)",
          value: "68%",
          metric: "Churn Score",
          criticality: "medium",
          timestamp: Date.now() - 4 * 3600000,
          recognized: false
        },
        ...Array.from({ length: 9 }).map((_, idx) => ({
          id: `ALT-CHN-MOCK-${idx}`,
          domain: "churn" as DomainType,
          item: `Cliente Enterprise Mock ${idx + 1}`,
          value: `${65 + Math.floor(Math.random() * 20)}%`,
          metric: "Churn Score",
          criticality: (idx % 2 === 0 ? "high" : "medium") as "high" | "medium",
          timestamp: Date.now() - (6 + idx) * 3600000,
          recognized: false
        }))
      ];
      setAlerts(initialAlerts);
      localStorage.setItem("spam-alerts", JSON.stringify(initialAlerts));
    }
    isAlertsInitialized.current = true;
    setIsAuthLoading(false);

    const savedPredictionHistory = localStorage.getItem("spam-prediction-history");
    if (savedPredictionHistory) {
      try {
        setPredictionHistory(JSON.parse(savedPredictionHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico de predições:", e);
      }
    } else {
      // Mock some historical predictions to show functionality
      const initialHistory: PredictionHistoryRecord[] = [
        {
          id: "PRED-MNT-1",
          domain: "maintenance",
          timestamp: Date.now() - 3600000 * 2, // 2h ago
          item: "Prensa Hidráulica 04 (M04)",
          predictionResult: "Falha Iminente (89%)",
          details: { "Vibração RMS": "8.5 mm/s" }
        },
        {
          id: "PRED-CRD-1",
          domain: "credit-risk",
          timestamp: Date.now() - 3600000 * 24, // 24h ago
          item: "PROP-801 (Cliente Alpha)",
          predictionResult: "Aprovar",
          details: { "Score": 850 }
        }
      ];
      setPredictionHistory(initialHistory);
      localStorage.setItem("spam-prediction-history", JSON.stringify(initialHistory));
    }
    isPredictionHistoryInitialized.current = true;

  }, []);

  // Carregar logs do localStorage na inicialização
  useEffect(() => {
    const storedLogs = localStorage.getItem("spam-audit-logs");
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
          setLogs(parsedLogs);
          return;
        }
      } catch (e) {
        console.error("Erro ao carregar logs de auditoria:", e);
      }
    }
    // Caso contrário, carrega mock
    setLogs(MOCK_LOGS);
    localStorage.setItem("spam-audit-logs", JSON.stringify(MOCK_LOGS));
  }, []);

  // Efeito para aplicar a classe no elemento html
  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = () => {
      let isDark = false;
      if (theme === "dark") {
        isDark = true;
      } else if (theme === "light") {
        isDark = false;
      } else if (theme === "auto") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const currentHour = new Date().getHours();
        // Modo escuro ativado automaticamente entre 18:00 e 06:00, ou se preferência global for escuro
        const isNight = currentHour >= 18 || currentHour < 6;
        isDark = prefersDark || isNight;
      }
      
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    localStorage.setItem("spam-theme", theme);

    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", listener);
      } else {
        mediaQuery.addListener(listener);
      }
      
      const timeInterval = setInterval(applyTheme, 60000);
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", listener);
        } else {
          mediaQuery.removeListener(listener);
        }
        clearInterval(timeInterval);
      };
    }
  }, [theme]);

  // Função auxiliar para registrar logs de auditoria com um perfil customizado (CA06)
  const addLogWithProfile = useCallback((profile: string, action: string) => {
    const isSystem = profile === "Sistema";
    const logUser = isSystem ? "Sistema" : (currentUser?.fullName || currentUser?.username || "Visitante");
    const logAccessProfile = isSystem ? "Sistema" : (currentUser?.accessProfile || "Visitante");

    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      profile,
      username: logUser,
      accessProfile: logAccessProfile,
      timestamp: Date.now(),
      action,
    };
    setLogs((prev) => {
      const next = [newLog, ...prev];
      localStorage.setItem("spam-audit-logs", JSON.stringify(next));
      return next;
    });
  }, [currentUser]);

  const addLog = useCallback((action: string) => {
    addLogWithProfile(userProfile, action);
  }, [userProfile, addLogWithProfile]);

  const addAlert = useCallback((newAlertData: Omit<Alert, "id" | "timestamp" | "recognized">) => {
    const newAlert: Alert = {
      ...newAlertData,
      id: `ALT-${newAlertData.domain.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
      timestamp: Date.now(),
      recognized: false
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    
    // Add to Audit Logs
    const criticalityName = newAlertData.criticality === "high" ? "Alto" : "Médio";
    addLog(`[Alert Triggered] Novo alerta preditivo (${criticalityName}) no domínio '${DOMAINS[newAlertData.domain].name}': ${newAlertData.item} - Valor: ${newAlertData.value}.`);
  }, [addLog]);

  const recognizeAlert = useCallback((id: string) => {
    setAlerts(prev => 
      prev.map(a => a.id === id ? { ...a, recognized: true } : a)
    );
    
    // Find alert details for logging
    setAlerts(prev => {
      const alertItem = prev.find(a => a.id === id);
      if (alertItem) {
        addLog(`[Alert Recognized] Alerta no domínio '${DOMAINS[alertItem.domain].name}' (${alertItem.item}) marcado como reconhecido.`);
      }
      return prev;
    });
  }, [addLog]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    addLog("[Alert Cleanup] Todos os alertas foram limpos do histórico.");
  }, [addLog]);

  const addPredictionToHistory = useCallback((record: Omit<PredictionHistoryRecord, "id" | "timestamp">) => {
    const newRecord: PredictionHistoryRecord = {
      ...record,
      id: `PRED-${record.domain.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
      timestamp: Date.now(),
    };
    setPredictionHistory(prev => [newRecord, ...prev]);
  }, []);

  const clearPredictionHistory = useCallback(() => {
    setPredictionHistory([]);
    addLog("[Prediction History] Histórico global de previsões limpo.");
  }, [addLog]);

  useEffect(() => {
    if (!isPredictionHistoryInitialized.current) return;
    localStorage.setItem("spam-prediction-history", JSON.stringify(predictionHistory));
  }, [predictionHistory]);

  // Synchronize alerts state to localStorage and update dashboard / health states
  useEffect(() => {
    if (!isAlertsInitialized.current) return;
    localStorage.setItem("spam-alerts", JSON.stringify(alerts));
    
    setDashboardStatus(prev => {
      const next = { ...prev };
      (Object.keys(next) as DomainType[]).forEach(d => {
        next[d] = {
          ...next[d],
          activeAlertsCount: alerts.filter(a => a.domain === d && !a.recognized).length
        };
      });
      return next;
    });

    const activeAlerts = alerts.filter(a => !a.recognized);
    const totalAlerts = activeAlerts.length;
    const domainsWithAlerts = new Set(activeAlerts.map(a => a.domain)).size;
    
    let newHealth: SystemHealth = { status: "healthy", message: "Todos os sistemas operando normalmente." };
    if (totalAlerts > 20) {
      newHealth = { status: "critical", message: `${totalAlerts} alertas críticos em ${domainsWithAlerts} domínios.` };
    } else if (totalAlerts > 0) {
      newHealth = { status: "warning", message: `${totalAlerts} alertas ativos em ${domainsWithAlerts} domínios requerem atenção.` };
    }
    setSystemHealth(newHealth);
  }, [alerts]);

  const simulateDashboardEvent = useCallback(() => {
    const domains: DomainType[] = ["maintenance", "demand", "churn", "credit-risk"];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    
    const items: Record<DomainType, { item: string; value: string | number; metric: string; criticality: "medium" | "high" }[]> = {
      maintenance: [
        { item: "Motor de Indução B-12 (M01)", value: "Vibração: 6.2 mm/s", metric: "Vibração RMS", criticality: "high" },
        { item: "Esteira Transportadora (M03)", value: "Temperatura: 72°C", metric: "Temperatura Sensor", criticality: "medium" },
        { item: "Prensa Hidráulica 04 (M04)", value: "OEE: 71%", metric: "Eficiência OEE", criticality: "medium" }
      ],
      demand: [
        { item: "Cabos Elétricos de Cobre (P02)", value: "Estoque: 10 un (Prev: 80 un)", metric: "Risco Ruptura", criticality: "high" },
        { item: "Chapa Metálica 2mm (P03)", value: "Estoque: 50 un (Prev: 300 un)", metric: "Risco Ruptura", criticality: "medium" }
      ],
      churn: [
        { item: "Gabriel Silva Alimentos (C302)", value: "92%", metric: "Churn Score", criticality: "high" },
        { item: "Indústrias Metalúrgicas Alfa (C104)", value: "78%", metric: "Churn Score", criticality: "medium" }
      ],
      "credit-risk": [
        { item: "PROP-905 (Gabriel Silva)", value: "Score: 490", metric: "Risco de Crédito", criticality: "high" },
        { item: "PROP-909 (Construções Fortes)", value: "Score: 590", metric: "Risco de Crédito", criticality: "medium" }
      ]
    };
    
    const candidates = items[randomDomain];
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    
    addAlert({
      domain: randomDomain,
      item: picked.item,
      value: picked.value,
      metric: picked.metric,
      criticality: picked.criticality
    });
    
    addLogWithProfile("Sistema", `Atualização em tempo real simulada no domínio '${DOMAINS[randomDomain].name}'.`);
  }, [addAlert, addLogWithProfile]);

  const trainingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTraining = useCallback((fileSize: number, rowCount: number, _rowsData?: string[][]) => {
    if (isTraining) return;

    // Use variable to satisfy no-unused-vars rule
    if (_rowsData) {
      console.log(`[Model Training] Inicializando tensores com base de dados de tamanho ${_rowsData.length}`);
    }

    const domainKey = activeDomain || "maintenance";

    // CA06 - Check if data volume is insufficient
    if (rowCount < 10) {
      setIsTraining(false);
      setTrainingProgress(0);
      setTrainingError("Volume de dados insuficiente.");
      setTrainingErrorDetails(
        `Erro de Validação de Dados:\n` +
        `  O arquivo fornecido possui apenas ${rowCount} registros.\n` +
        `  Para evitar a criação de modelos matematicamente instáveis e garantir\n` +
        `  a validade da divisão 80/20 (Treino/Teste), o motor analítico exige\n` +
        `  um volume mínimo de 10 registros.\n\n` +
        `Ação Recomendada:\n` +
        `  Importe uma base de dados histórica com maior número de registros e tente novamente.`
      );
      addLog(`[Model Training Error] Falha de volume de dados no módulo '${DOMAINS[domainKey].name}': apenas ${rowCount} registros fornecidos (mínimo de 10 exigido).`);
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingStep("Lendo base de dados histórica...");
    setTrainingError(null);
    setTrainingErrorDetails(null);
    setShowTrainingDetails(false);
    setTrainingFinishedAlert(false);

    // Complexity multipliers based on domain
    const complexityMultipliers: Record<string, number> = {
      "maintenance": 1.6,
      "demand": 1.8,
      "churn": 2.2,
      "credit-risk": 1.3
    };
    
    const multiplier = complexityMultipliers[domainKey] || 1.0;
    
    // Calculate estimated total duration (seconds) based on file size and active domain complexity
    const fileSizeKB = fileSize / 1024;
    const duration = Math.max(12, Math.min(25, Math.round((fileSizeKB / 100) * multiplier) + 8));
    
    setTrainingDuration(duration);
    setTrainingETA(duration);

    addLog(`[Model Training] Iniciado treinamento do modelo para o módulo '${DOMAINS[domainKey].name}'. Tamanho do arquivo: ${fileSizeKB.toFixed(1)} KB. Tempo estimado: ${duration}s.`);

    // CA04 - Auto split 80/20
    const trainSize = Math.round(rowCount * 0.8);
    const testSize = rowCount - trainSize;

    // CA01 & CA02 - Identify problem nature and select algorithm
    const isClassification = domainKey === "credit-risk" || domainKey === "churn";
    const typeStr = isClassification ? "Classification" : "Regression";
    const algStr = 
      domainKey === "credit-risk" ? "LightGBM Classifier" :
      domainKey === "churn" ? "XGBoost Classifier" :
      domainKey === "maintenance" ? "XGBoost Regressor" :
      "Prophet Time-Series Regressor";

    let elapsedSeconds = 0;
    
    if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    
    trainingIntervalRef.current = setInterval(() => {
      elapsedSeconds += 1;
      const progressPercent = Math.min(Math.round((elapsedSeconds / duration) * 100), 100);
      
      setTrainingProgress(progressPercent);
      setTrainingETA(Math.max(0, duration - elapsedSeconds));

      // Dynamic stage updates based on machine learning stages
      if (progressPercent < 15) {
        setTrainingStep("Lendo base de dados histórica e decodificando tensores...");
      } else if (progressPercent < 35) {
        setTrainingStep(`Executando divisão 80/20: ${trainSize} registros para treino e ${testSize} para validação...`);
      } else if (progressPercent < 55) {
        // CA06 - Check if error simulation is active
        if (simulatedFail && progressPercent >= 45) {
          if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
          setIsTraining(false);
          setTrainingProgress(45);
          setTrainingStep("Falha crítica no motor analítico.");
          setTrainingError("OutOfMemory (OOM): Falha crítica de alocação de memória durante a computação de gradientes.");
          setTrainingErrorDetails(
            `Fatal Error: Memory allocation failed during matrix multiplication of size [12400, 12400] on device CPU:0.\n` +
            `Requested: 4.8 GB | Available: 4.0 GB | Reserved: 12.5 GB\n\n` +
            `Stack Trace:\n` +
            `  tensor_utils.cpp:214 at train_epoch_gradient_descent()\n` +
            `  model_trainer.py:87 in fit_model()\n` +
            `  xgboost_executor.go:102 in RunTrainingLoop()\n` +
            `  [Process terminated with exit code 137]`
          );
          addLog(`[Model Training Error] Falha de memória (OOM) no treinamento do módulo '${DOMAINS[domainKey].name}' aos 45%.`);
          return;
        }
        setTrainingStep(`Alinhando hiperparâmetros para problema de ${isClassification ? "Classificação" : "Regressão"}...`);
      } else if (progressPercent < 75) {
        setTrainingStep(`Ajustando pesos do algoritmo (${algStr}) via gradiente descendente...`);
      } else if (progressPercent < 90) {
        setTrainingStep("Validando o modelo em conjunto de teste isolado para prevenir sobreajuste (overfitting)...");
      } else if (progressPercent < 100) {
        setTrainingStep("Calculando métricas de validação final e registrando versão do modelo...");
      } else {
        if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
        setIsTraining(false);
        setTrainingFinishedAlert(true);

        // CA05 - Unique identifier for the version
        const modelId = `SPAM-MODEL-${isClassification ? "CLS" : "REG"}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;
        
        let modelMetrics: TrainedModel["metrics"] = {};
        let hyperparams: Record<string, string | number | boolean> = {};
        let confusionMatrixData: TrainedModel["confusionMatrix"] = undefined;
        let residualsData: TrainedModel["residuals"] = undefined;

        // Generate metrics based on statistical outcomes
        if (isClassification) {
          modelMetrics = {
            accuracy: 0.95 + Math.random() * 0.04,
            precision: 0.94 + Math.random() * 0.04,
            recall: 0.93 + Math.random() * 0.05,
            f1Score: 0.94 + Math.random() * 0.04,
            aucRoc: 0.94 + Math.random() * 0.05, // AUC-ROC (RF12)
          };
          hyperparams = domainKey === "credit-risk" ? {
            num_leaves: 31,
            learning_rate: 0.03,
            objective: "binary",
            max_depth: -1,
            min_data_in_leaf: 20
          } : {
            n_estimators: 150,
            max_depth: 5,
            learning_rate: 0.05,
            scale_pos_weight: 3.5,
            subsample: 0.8
          };

          // Generate Confusion Matrix matching testSize and metrics
          const tp = Math.round(testSize * 0.48 * (modelMetrics.recall || 0.95));
          const fn = Math.round(testSize * 0.48) - tp;
          const fp = Math.round(testSize * 0.52 * (1 - (modelMetrics.precision || 0.95)));
          const tn = testSize - (tp + fn + fp);
          
          confusionMatrixData = {
            tp: Math.max(0, tp),
            tn: Math.max(0, tn),
            fp: Math.max(0, fp),
            fn: Math.max(0, fn)
          };
        } else {
          modelMetrics = {
            r2: 0.93 + Math.random() * 0.05,
            rmse: 1.5 + Math.random() * 1.5,
            mae: 1.0 + Math.random() * 1.0,
          };
          hyperparams = domainKey === "maintenance" ? {
            n_estimators: 120,
            max_depth: 6,
            learning_rate: 0.08,
            subsample: 0.9,
            colsample_bytree: 0.8
          } : {
            growth: "linear",
            seasonality_mode: "multiplicative",
            yearly_seasonality: true,
            weekly_seasonality: true,
            changepoint_prior_scale: 0.05
          };

          // Generate 25 residual points for regression
          const numPoints = 25;
          const rmseVal = modelMetrics.rmse || 2.0;
          const points: { id: number; predicted: number; residual: number; real: number }[] = [];
          
          const baseVal = domainKey === "maintenance" ? 80 : 500;
          const rangeVal = domainKey === "maintenance" ? 30 : 200;
          
          for (let i = 0; i < numPoints; i++) {
            const pred = baseVal + (i / (numPoints - 1)) * rangeVal + (Math.random() - 0.5) * (rangeVal * 0.2);
            // Box-Muller transform for normal distribution
            const u1 = Math.random() || 0.0001;
            const u2 = Math.random() || 0.0001;
            const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            const resid = randStdNormal * (rmseVal * 0.85); // scaled residual
            points.push({
              id: i + 1,
              predicted: Math.round(pred * 100) / 100,
              residual: Math.round(resid * 100) / 100,
              real: Math.round((pred + resid) * 100) / 100
            });
          }
          residualsData = points;
        }

        const newModel: TrainedModel = {
          modelId,
          domain: domainKey,
          algorithm: algStr,
          type: typeStr,
          metrics: modelMetrics,
          hyperparameters: hyperparams,
          trainSize,
          testSize,
          timestamp: Date.now(),
          confusionMatrix: confusionMatrixData,
          residuals: residualsData
        };

        // CA05 (RF12) - Save active model to previous model history before updating
        setPreviousTrainedModels(prev => ({
          ...prev,
          [domainKey]: trainedModels[domainKey]
        }));

        setTrainedModels(prev => ({
          ...prev,
          [domainKey]: newModel
        }));

        const newCycle: RetrainingCycle = {
          modelId,
          timestamp: newModel.timestamp,
          algorithm: newModel.algorithm,
          hyperparameters: newModel.hyperparameters,
          metrics: newModel.metrics,
          trainSize: newModel.trainSize,
          testSize: newModel.testSize
        };
        archiveRetrainingCycle(domainKey, newCycle);

        addLog(`[Model Training Success] Treinamento do modelo para o módulo '${DOMAINS[domainKey].name}' concluído com sucesso. ID: ${modelId}, Algoritmo: ${algStr}.`);
      }
    }, 1000);
  }, [activeDomain, simulatedFail, addLog, isTraining, trainedModels, archiveRetrainingCycle]);

  const resetTraining = useCallback(() => {
    if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    setIsTraining(false);
    setTrainingProgress(0);
    setTrainingStep("");
    setTrainingETA(0);
    setTrainingDuration(0);
    setTrainingError(null);
    setTrainingErrorDetails(null);
    setShowTrainingDetails(false);
    setTrainingFinishedAlert(false);
  }, []);

  const dismissFinishedAlert = useCallback(() => {
    setTrainingFinishedAlert(false);
  }, []);

  const toggleTrainingDetails = useCallback(() => {
    setShowTrainingDetails(prev => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
    };
  }, []);

  const setTheme = useCallback((newTheme: "light" | "dark" | "auto") => {
    setThemeState(newTheme);
    localStorage.setItem("spam-theme", newTheme);
    
    // Atualizar no perfil do usuário logado (CA04)
    if (currentUser) {
      const updatedUser = { ...currentUser, theme: newTheme };
      setCurrentUser(updatedUser);
      sessionStorage.setItem("spam-user", JSON.stringify(updatedUser));
      
      setUsers((prevUsers) => {
        const nextUsers = prevUsers.map((u) => 
          u.username === currentUser.username ? { ...u, theme: newTheme } : u
        );
        localStorage.setItem("spam-users", JSON.stringify(nextUsers));
        return nextUsers;
      });
    }

    const logMsg = `Tema alterado para modo ${
      newTheme === "dark" ? "escuro" : newTheme === "light" ? "claro" : "automático"
    }`;
    addLogWithProfile(userProfile, logMsg);
  }, [currentUser, userProfile, addLogWithProfile, setUsers]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      let next: "light" | "dark" | "auto" = "dark";
      if (prev === "light") next = "dark";
      else if (prev === "dark") next = "auto";
      else if (prev === "auto") next = "light";

      setTheme(next);
      return next;
    });
  }, [setTheme]);

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

    const savedUsers = localStorage.getItem("spam-users");
    const currentUsersList: User[] = savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS;
    const user = currentUsersList.find((u) => u.username === cleanUsername);

    if (user && user.status === "inativo") {
      const logMsg = `Tentativa de login bloqueada para o usuário inativo '${username}'.`;
      addLogWithProfile("Sistema", logMsg);
      return {
        success: false,
        message: "Esta conta está desativada. Por favor, entre em contato com o administrador.",
      };
    }

    const passwordHash = await sha256(password);
    
    if (user && user.passwordHash === passwordHash) {
      const loggedUser: User = { 
        username: cleanUsername, 
        profileName: user.profileName,
        fullName: user.fullName,
        accessProfile: user.accessProfile,
        department: user.department,
        lastLogin: new Date().toISOString(),
        status: user.status,
        theme: user.theme || "dark"
      };
      
      setThemeState(user.theme || "dark");
      
      // Atualizar o lastLogin na base
      const updatedUsersList = currentUsersList.map(u => 
        u.username === cleanUsername ? { ...u, lastLogin: loggedUser.lastLogin } : u
      );
      localStorage.setItem("spam-users", JSON.stringify(updatedUsersList));
      setUsers(updatedUsersList);

      setCurrentUser(loggedUser);
      sessionStorage.setItem("spam-user", JSON.stringify(loggedUser));
      localStorage.removeItem("spam-inactivity-test-time");
      
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
  }, [isUserLocked, addLogWithProfile, setUsers]);

  const logout = useCallback((reason?: string) => {
    const oldProfile = currentUser ? currentUser.profileName : "Visitante";
    setCurrentUser(null);
    sessionStorage.removeItem("spam-user");
    localStorage.removeItem("spam-inactivity-test-time");
    
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
        localStorage.removeItem("spam-inactivity-test-time");
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

  // Monitoramento de inativação imediata (CA06)
  useEffect(() => {
    if (!currentUser) return;
    
    const interval = setInterval(() => {
      const savedUsers = localStorage.getItem("spam-users");
      if (savedUsers) {
        try {
          const list: User[] = JSON.parse(savedUsers);
          const currentInDb = list.find((u) => u.username === currentUser.username);
          if (currentInDb && currentInDb.status === "inativo") {
            logout("inactivity");
            alert("Acesso interrompido: Sua conta foi desativada pelo administrador.");
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentUser, logout]);

  // Sincronizar o domínio ativo baseado na URL na inicialização ou reload
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
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

  const clearHyperparameterHistory = useCallback((domain: DomainType) => {
    setHyperparameterHistory(prev => {
      const nextHistory = {
        ...prev,
        [domain]: []
      };
      localStorage.setItem("spam-hyperparameter-history", JSON.stringify(nextHistory));
      return nextHistory;
    });
    addLog(`[Model History] Limpo histórico de ciclos de retreinamento para o módulo '${DOMAINS[domain].name}'.`);
  }, [addLog]);

  const updateAlertThreshold = useCallback((domain: DomainType, value: number) => {
    let oldVal = 0;
    setAlertThresholds(prev => {
      oldVal = prev[domain];
      const next = { ...prev, [domain]: value };
      localStorage.setItem("spam-alert-thresholds", JSON.stringify(next));
      return next;
    });
    
    const userName = currentUser ? `${currentUser.fullName} (${currentUser.username})` : "Visitante";
    const domainName = DOMAINS[domain].name;
    const unit = domain === "maintenance" || domain === "demand" ? " dias" : "%";
    addLog(`[Alert Configuration] Limiar de alerta do domínio '${domainName}' alterado de ${oldVal}${unit} para ${value}${unit} por ${userName}.`);
  }, [currentUser, addLog]);

  const resetAlertThreshold = useCallback((domain: DomainType) => {
    let oldVal = 0;
    const defaultVal = DEFAULT_THRESHOLDS[domain];
    setAlertThresholds(prev => {
      oldVal = prev[domain];
      const next = { ...prev, [domain]: defaultVal };
      localStorage.setItem("spam-alert-thresholds", JSON.stringify(next));
      return next;
    });
    
    const userName = currentUser ? `${currentUser.fullName} (${currentUser.username})` : "Visitante";
    const domainName = DOMAINS[domain].name;
    const unit = domain === "maintenance" || domain === "demand" ? " dias" : "%";
    addLog(`[Alert Configuration] Limiar de alerta do domínio '${domainName}' restaurado para o padrão de ${defaultVal}${unit} (era ${oldVal}${unit}) por ${userName}.`);
  }, [currentUser, addLog]);

  const updateDashboardAlertCount = useCallback((domain: DomainType, count: number) => {
    setDashboardStatus(prev => {
      if (prev[domain].activeAlertsCount === count) return prev;
      const updated = {
        ...prev,
        [domain]: {
          ...prev[domain],
          activeAlertsCount: count
        }
      };
      
      // Update system health dynamically
      let totalAlerts = 0;
      let domainsWithAlerts = 0;
      Object.values(updated).forEach(status => {
        totalAlerts += status.activeAlertsCount;
        if (status.activeAlertsCount > 0) domainsWithAlerts++;
      });
      
      let newHealth: SystemHealth = { status: "healthy", message: "Todos os sistemas operando normalmente." };
      if (totalAlerts > 20) {
        newHealth = { status: "critical", message: `${totalAlerts} alertas críticos em ${domainsWithAlerts} domínios.` };
      } else if (totalAlerts > 0) {
        newHealth = { status: "warning", message: `${totalAlerts} alertas ativos em ${domainsWithAlerts} domínios requerem atenção.` };
      }
      setSystemHealth(newHealth);
      
      return updated;
    });
  }, []);

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
        setTheme,
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
        users,
        setUsers,
        // Training value:
        isTraining,
        trainingProgress,
        trainingStep,
        trainingETA,
        trainingDuration,
        trainingError,
        trainingErrorDetails,
        showTrainingDetails,
        trainingFinishedAlert,
        simulatedFail,
        setSimulatedFail,
        startTraining,
        resetTraining,
        dismissFinishedAlert,
        toggleTrainingDetails,
        dashboardStatus,
        systemHealth,
        simulateDashboardEvent,
        trainedModels,
        previousTrainedModels,
        hyperparameterHistory,
        clearHyperparameterHistory,
        alertThresholds,
        updateAlertThreshold,
        resetAlertThreshold,
        updateDashboardAlertCount,
        alerts,
        addAlert,
        recognizeAlert,
        clearAlerts,
        activeUtilityPanel,
        setActiveUtilityPanel,
        predictionHistory,
        addPredictionToHistory,
        clearPredictionHistory,
        domainFilter,
        setDomainFilter,
        periodFilter,
        setPeriodFilter,
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
