"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { translations, LanguageType } from "@/lib/translations";

export interface AuditLog {
  id: string;
  profile: string;
  username: string;
  accessProfile: string;
  timestamp: number;
  action: string;
}

export interface CustomThemeColors {
  primary: string;
  success: string;
  alert: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: CustomThemeColors;
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

let currentModuleLanguage: LanguageType = "pt";

export const DOMAINS: Record<DomainType, DomainMetadata> = {
  "maintenance": {
    id: "maintenance",
    get name() {
      if (currentModuleLanguage === "en") return "Equipment Maintenance";
      if (currentModuleLanguage === "es") return "Mantenimiento de Equipos";
      return "Manutenção de Equipamentos";
    },
    get description() {
      if (currentModuleLanguage === "en") return "Predictive analysis of machine failures, lifecycle, and preventive maintenance schedule based on sensors.";
      if (currentModuleLanguage === "es") return "Análisis predictivo de fallas de máquinas, ciclo de vida y cronograma de mantenimiento preventivo basado en sensores.";
      return "Análise preditiva de falhas em máquinas, ciclos de vida útil e cronograma de manutenção preventiva baseada em sensores.";
    },
    color: "amber",
    accentClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    bgGradient: "from-amber-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    iconName: "Wrench",
  },
  "demand": {
    id: "demand",
    get name() {
      if (currentModuleLanguage === "en") return "Demand Forecasting";
      if (currentModuleLanguage === "es") return "Previsión de Demanda";
      return "Previsão de Demanda";
    },
    get description() {
      if (currentModuleLanguage === "en") return "Time series modeling for sales, inventory, and seasonality projections with statistical intelligence.";
      if (currentModuleLanguage === "es") return "Modelado de series temporales para proyección de ventas, inventarios y estacionalidades con inteligencia estadística.";
      return "Modelagem de séries temporais para projeção de vendas, estoques e sazonalidades com inteligência estatística.";
    },
    color: "sky",
    accentClass: "text-sky-500 bg-sky-500/10 border-sky-500/30",
    bgGradient: "from-sky-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-sky-500/50 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]",
    iconName: "TrendingUp",
  },
  "churn": {
    id: "churn",
    get name() {
      if (currentModuleLanguage === "en") return "Customer Retention";
      if (currentModuleLanguage === "es") return "Retención de Clientes";
      return "Retenção de Clientes";
    },
    get description() {
      if (currentModuleLanguage === "en") return "Identification of cancellation patterns, customer churn risk scores, and targeted engagement actions.";
      if (currentModuleLanguage === "es") return "Identificación de patrones de cancelación, puntuación de riesgo de rotación de clientes y acciones de fidelización dirigidas.";
      return "Identificação de padrões de cancelamento, score de risco de rotatividade de clientes e ações de engajamento direcionadas.";
    },
    color: "violet",
    accentClass: "text-violet-500 bg-violet-500/10 border-violet-500/30",
    bgGradient: "from-violet-600/20 via-zinc-900 to-zinc-950",
    borderGlow: "group-hover:border-violet-500/50 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    iconName: "Users",
  },
  "credit-risk": {
    id: "credit-risk",
    get name() {
      if (currentModuleLanguage === "en") return "Credit Risk";
      if (currentModuleLanguage === "es") return "Riesgo de Crédito";
      return "Risco de Crédito";
    },
    get description() {
      if (currentModuleLanguage === "en") return "Evaluation of customer credit risk, solvency score, and analysis of default probability.";
      if (currentModuleLanguage === "es") return "Evaluación del riesgo crediticio de los clientes, puntuación de solvencia y análisis de la probabilidad de impago.";
      return "Avaliação de risco de crédito de clientes, score de adimplência e análise de probabilidade de inadimplência.";
    },
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
  language?: LanguageType;
}

export interface TrainedModel {
  modelId: string;
  domain: DomainType;
  version: string;
  datasetName: string;
  datasetSize: number;
  hash: string;
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
  datasetVersion: string;
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

export const generateModelHash = (model: Omit<TrainedModel, "hash">): string => {
  const str = JSON.stringify({
    modelId: model.modelId,
    domain: model.domain,
    version: model.version,
    datasetName: model.datasetName,
    datasetSize: model.datasetSize,
    algorithm: model.algorithm,
    type: model.type,
    metrics: model.metrics,
    hyperparameters: model.hyperparameters,
    trainSize: model.trainSize,
    testSize: model.testSize,
    timestamp: model.timestamp
  });
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

export interface RetrainingCycle {
  modelId: string;
  timestamp: number;
  algorithm: string;
  hyperparameters: Record<string, string | number | boolean>;
  metrics: TrainedModel["metrics"];
  trainSize: number;
  testSize: number;
}

export interface EmailNotificationsConfig {
  email: string;
  enabledDomains: Record<DomainType, boolean>;
}

export interface SchedulingConfig {
  domain: DomainType;
  frequency: "daily" | "weekly" | "monthly";
  startTime: string; // "HH:MM"
  specificDay?: number; // 1-7 para semanal, 1-31 para mensal
  isActive: boolean;
  lastRun?: number;
}

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  isPaused: boolean;
  isCompleted: boolean;
  totalSteps: number;
}

export interface SimulatedEmail {
  id: string;
  recipient: string;
  domain: DomainType;
  timestamp: number;
  alerts: {
    item: string;
    value: string | number;
    threshold: number;
    timestamp: number;
  }[];
  // RF42 agendamento:
  isScheduledReport?: boolean;
  scheduleStatus?: "success" | "failure";
  completionTime?: string;
  metricsSummary?: {
    accuracy?: number;
    r2?: number;
    f1Score?: number;
    rmse?: number;
  };
  errorDescription?: string;
}

export interface SystemBackup {
  id: string;
  timestamp: number;
  type: "auto" | "manual";
  content: string; // JSON string of all persisted state
  hash: string;
  sizeBytes: number;
  integrityStatus: "valid" | "invalid" | "unknown";
}

export interface BackupConfig {
  maxBackups: number;
  frequency: "none" | "daily" | "weekly" | "monthly";
}

export type GlossaryCategory = "Geral" | "Machine Learning" | "Métricas" | "Logística" | "Previsão";

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: GlossaryCategory;
  relatedTerms?: string[];
}

export interface TrashItem {
  id: string;
  name: string;
  type: string;
  deletedAt: string;
  deletedBy: string;
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
  addLogWithProfile: (profile: string, action: string) => void;
  privacyNoticeText: string;
  savePrivacyNoticeText: (text: string) => void;
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
  startTraining: (fileSize: number, rowCount: number, _rowsData?: string[][], datasetName?: string) => void;
  resetTraining: () => void;
  dismissFinishedAlert: () => void;
  toggleTrainingDetails: () => void;
  // Dashboard fields:
  dashboardStatus: Record<DomainType, DomainStatus>;
  systemHealth: SystemHealth;
  simulateDashboardEvent: () => void;
  trainedModels: Record<DomainType, TrainedModel | null>;
  previousTrainedModels: Record<DomainType, TrainedModel | null>;
  modelsHistory: Record<DomainType, TrainedModel[]>;
  setModelActive: (domain: DomainType, modelId: string) => void;
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
  selectedAlgorithms: Record<DomainType, string>;
  setSelectedAlgorithm: (domain: DomainType, algorithm: string) => void;
  trainedModelsByAlgorithm: Record<DomainType, Record<string, TrainedModel | null>>;
  currentView: string;
  setCurrentView: (view: string) => void;
  emailConfig: EmailNotificationsConfig;
  updateEmailConfig: (config: EmailNotificationsConfig) => void;
  sentEmails: SimulatedEmail[];
  clearSentEmails: () => void;
  showPremiumToast: (message: string, type?: "success" | "error") => void;
  simulateCriticalAlertsBatch: () => void;
  activeCustomTheme: CustomTheme | null;
  customThemes: CustomTheme[];
  applyCustomTheme: (theme: CustomTheme | null) => void;
  saveCustomTheme: (name: string, colors: CustomThemeColors) => void;
  deleteCustomTheme: (id: string) => void;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string, params?: Record<string, string>) => string;
  getDomainName: (type: DomainType) => string;
  activeProfileSection: "preferences" | "admin" | "theme" | "tuning";
  setActiveProfileSection: (section: "preferences" | "admin" | "theme" | "tuning") => void;
  activeProfileSubSection: "appearance" | "language" | "";
  setActiveProfileSubSection: (sub: "appearance" | "language" | "") => void;

  // Glossary fields:
  glossary: GlossaryTerm[];
  addGlossaryTerm: (term: Omit<GlossaryTerm, "id">) => void;
  updateGlossaryTerm: (id: string, term: Omit<GlossaryTerm, "id">) => void;
  deleteGlossaryTerm: (id: string) => void;
  getGlossaryTerm: (id: string) => GlossaryTerm | undefined;
  // Trash fields:
  trashItems: TrashItem[];
  restoreTrashItems: (ids: string[]) => void;
  deleteTrashItemsPermanently: (ids: string[]) => void;
  emptyTrash: () => void;

  // Agendamento (RF42)
  schedules: Record<DomainType, SchedulingConfig | null>;
  saveSchedule: (domain: DomainType, config: Omit<SchedulingConfig, "domain">) => void;
  deleteSchedule: (domain: DomainType) => void;
  runScheduledTrigger: (domain: DomainType) => void;

  // RF48 Backups Automáticos
  systemBackups: SystemBackup[];
  backupConfig: BackupConfig;
  createBackup: (type: "auto" | "manual") => void;
  restoreBackup: (id: string) => void;
  deleteBackup: (id: string) => void;
  updateBackupConfig: (config: BackupConfig) => void;

  // RF57 Tutorial Interativo
  tutorialState: TutorialState;
  startTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  endTutorial: () => void;
  advanceTutorialStep: (expectedStep: number) => void;
}

const DomainContext = createContext<DomainContextProps | undefined>(undefined);

// Helper function to hash password client-side (CA05)
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper function to show a premium toast notification
function showPremiumToast(message: string, type: "success" | "error" = "success") {
  if (typeof document === "undefined") return;

  let container = document.getElementById("premium-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "premium-toast-container";
    container.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `px-4 py-3 rounded-xl border shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300 pointer-events-auto max-w-sm transition-all text-xs font-semibold ${
    type === "success"
      ? "bg-zinc-900/90 border-emerald-500/30 text-emerald-400 backdrop-blur-md"
      : "bg-zinc-900/90 border-rose-500/30 text-rose-400 backdrop-blur-md"
  }`;

  const icon = document.createElement("span");
  icon.innerHTML = type === "success" ? "✓" : "✕";
  icon.className = `flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${
    type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
  }`;
  toast.appendChild(icon);

  const text = document.createElement("span");
  text.textContent = message;
  toast.appendChild(text);

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => {
      toast.remove();
      if (container && container.childElementCount === 0) {
        container.remove();
      }
    }, 300);
  }, 4000);
}

// Helper function to validate model integrity (CA05)
function validateModelIntegrity(model: TrainedModel): boolean {
  if (!model) return false;
  if (!model.modelId || !model.domain || !model.algorithm || !model.type || !model.metrics) return false;
  if (model.trainSize === undefined || model.testSize === undefined || !model.timestamp) return false;
  
  if (model.type === "Classification") {
    if (
      model.metrics.accuracy === undefined ||
      model.metrics.precision === undefined ||
      model.metrics.recall === undefined ||
      model.metrics.f1Score === undefined ||
      model.metrics.aucRoc === undefined
    ) {
      return false;
    }
  } else {
    if (
      model.metrics.r2 === undefined ||
      model.metrics.rmse === undefined ||
      model.metrics.mae === undefined
    ) {
      return false;
    }
  }

  if (typeof window !== "undefined" && localStorage.getItem("spam-simulate-integrity-corruption") === "true") {
    return false;
  }

  return true;
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

// Conversor de Hexadecimal para HSL (RF53)
function hexToHsl(hex: string): { h: number; s: number; l: number; str: string } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  
  return {
    h: hDeg,
    s: sPct,
    l: lPct,
    str: `${hDeg} ${sPct}% ${lPct}%`
  };
}

const DEFAULT_GLOSSARY: GlossaryTerm[] = [
  { id: "1", term: "Churn Rate", definition: "A taxa de cancelamento de clientes em um determinado período. Representa a porcentagem de assinantes que deixaram de usar o serviço.", category: "Métricas", relatedTerms: ["6"] },
  { id: "2", term: "OEE (Overall Equipment Effectiveness)", definition: "Eficiência Global do Equipamento. É uma métrica padrão ouro para medir a produtividade de manufatura, combinando Disponibilidade, Desempenho e Qualidade.", category: "Geral" },
  { id: "3", term: "VaR (Value at Risk)", definition: "Valor em Risco. Uma medida estatística usada para quantificar o nível de risco financeiro em um portfólio, empresa ou investimento em um período específico.", category: "Métricas" },
  { id: "4", term: "Overfitting", definition: "Quando um modelo de machine learning se ajusta muito bem aos dados de treinamento, mas perde a capacidade de generalizar para dados novos e não vistos.", category: "Machine Learning", relatedTerms: ["5"] },
  { id: "5", term: "Underfitting", definition: "Quando um modelo é simples demais e não consegue capturar a relação subjacente nos dados de treinamento, apresentando baixa precisão tanto no treino quanto no teste.", category: "Machine Learning", relatedTerms: ["4"] },
  { id: "6", term: "NPS (Net Promoter Score)", definition: "Métrica de lealdade do cliente que mede a disposição dos clientes em recomendar os produtos ou serviços da empresa para outros.", category: "Métricas", relatedTerms: ["1"] },
  { id: "7", term: "Feature Engineering", definition: "Processo de usar o conhecimento do domínio para extrair características (features) dos dados brutos e melhorar o desempenho dos algoritmos de aprendizado de máquina.", category: "Machine Learning" },
  { id: "8", term: "Data Lineage", definition: "Rastreabilidade do ciclo de vida dos dados, desde sua origem até os pontos onde são consumidos, detalhando as transformações que sofreram no caminho.", category: "Geral" },
  { id: "9", term: "Lead Time", definition: "Tempo total gasto desde a iniciação de um processo até a sua conclusão, essencial no planejamento logístico.", category: "Logística" },
  { id: "10", term: "Acurácia", definition: "A proporção de predições corretas em relação ao total de predições realizadas por um modelo.", category: "Métricas", relatedTerms: ["11"] },
  { id: "11", term: "F1-Score", definition: "Média harmônica entre Precisão e Recall. Muito útil quando as classes estão desbalanceadas.", category: "Métricas", relatedTerms: ["10"] }
];

const DEFAULT_TRASH: TrashItem[] = [
  { id: "TRASH-01", name: "Modelo Random Forest - Teste 1", type: "Modelo Preditivo", deletedAt: new Date(Date.now() - 2 * 86400000).toISOString(), deletedBy: "Administrador do Sistema" },
  { id: "TRASH-02", name: "Relatório Financeiro Q3", type: "Arquivo CSV", deletedAt: new Date(Date.now() - 5 * 86400000).toISOString(), deletedBy: "João Silva" },
  { id: "TRASH-03", name: "Filtro Personalizado 'Alta Evasão'", type: "Configuração", deletedAt: new Date(Date.now() - 10 * 86400000).toISOString(), deletedBy: "Administrador do Sistema" },
];


export function DomainProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [activeDomain, setActiveDomain] = useState<DomainType | null>(null);
  const [currentView, setCurrentView] = useState<string>("monitoring");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [privacyNoticeText, setPrivacyNoticeText] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetDomain, setTargetDomain] = useState<DomainType | null>(null);
  const [confirmSwitchOpen, setConfirmSwitchOpen] = useState(false);
  const [pendingDomain, setPendingDomain] = useState<DomainType | null>(null);
  const [theme, setThemeState] = useState<"light" | "dark" | "auto">("dark");
  const [activeCustomTheme, setActiveCustomTheme] = useState<CustomTheme | null>(null);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [language, setLanguageState] = useState<LanguageType>("pt");
  const [activeProfileSection, setActiveProfileSection] = useState<"preferences" | "admin" | "theme" | "tuning">("preferences");
  const [activeProfileSubSection, setActiveProfileSubSection] = useState<"appearance" | "language" | "">("");
  const [alertThresholds, setAlertThresholds] = useState<Record<DomainType, number>>(DEFAULT_THRESHOLDS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<"alerts" | "logs" | "predictions" | "menu" | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryRecord[]>([]);
  const [domainFilter, setDomainFilter] = useState<DomainType | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<"all" | "24h" | "7d" | "30d">("all");
  const isAlertsInitialized = useRef(false);
  const isPredictionHistoryInitialized = useRef(false);

  // Email Notification States (RF41)
  const [emailConfig, setEmailConfig] = useState<EmailNotificationsConfig>({
    email: "",
    enabledDomains: {
      maintenance: true,
      demand: true,
      churn: true,
      "credit-risk": true
    }
  });
  const [sentEmails, setSentEmails] = useState<SimulatedEmail[]>([]);

  // Scheduling States (RF42)
  const [schedules, setSchedules] = useState<Record<DomainType, SchedulingConfig | null>>({
    maintenance: null,
    demand: null,
    churn: null,
    "credit-risk": null
  });

  // Backup States (RF48)
  const [systemBackups, setSystemBackups] = useState<SystemBackup[]>([]);
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({ maxBackups: 5, frequency: "daily" });

  // Tutorial States (RF57)
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    isActive: false,
    currentStep: 0,
    isPaused: false,
    isCompleted: false,
    totalSteps: 5 // Default total steps
  });

  const emailBufferRef = useRef<Record<string, {
    alerts: {
      item: string;
      value: string | number;
      threshold: number;
      timestamp: number;
    }[];
    timerId: NodeJS.Timeout | null;
  }>>({});

  // Auth states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  // Glossary state
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const isGlossaryInitialized = useRef(false);

  // Trash state
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const isTrashInitialized = useRef(false);

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

  const [selectedAlgorithms, setSelectedAlgorithmsState] = useState<Record<DomainType, string>>({
    maintenance: "Random Forest",
    demand: "Random Forest",
    churn: "Random Forest",
    "credit-risk": "Random Forest"
  });

  const [trainedModelsByAlgorithm, setTrainedModelsByAlgorithm] = useState<Record<DomainType, Record<string, TrainedModel | null>>>({
    maintenance: { "Random Forest": null, "Regressão Linear": null },
    demand: { "Random Forest": null, "Regressão Linear": null },
    churn: { "Random Forest": null, "Regressão Logística": null },
    "credit-risk": { "Random Forest": null, "Regressão Logística": null }
  });

  // Track previous session model for comparison (RF12 - CA05)
  const [previousTrainedModels, setPreviousTrainedModels] = useState<Record<DomainType, TrainedModel | null>>({
    maintenance: null,
    demand: null,
    churn: null,
    "credit-risk": null
  });

  const [modelsHistory, setModelsHistory] = useState<Record<DomainType, TrainedModel[]>>({
    maintenance: [],
    demand: [],
    churn: [],
    "credit-risk": []
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
    let integrityErrorFound = false;
    const failedDomains: DomainType[] = [];

    // Carregar configurações de idioma (RF54) com dupla persistência (localStorage & Cookies)
    let savedLanguage: LanguageType | null = null;
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )spam-language=([^;]*)/);
      if (match) savedLanguage = match[1] as LanguageType;
    }
    if (!savedLanguage) {
      savedLanguage = localStorage.getItem("spam-language") as LanguageType | null;
    }
    
    let finalLanguage: LanguageType = "pt";

    if (savedLanguage && (savedLanguage === "pt" || savedLanguage === "en" || savedLanguage === "es")) {
      finalLanguage = savedLanguage;
      currentModuleLanguage = savedLanguage;
      setLanguageState(savedLanguage);
      // Sincronizar em ambos
      localStorage.setItem("spam-language", savedLanguage);
      if (typeof document !== "undefined") {
        document.cookie = `spam-language=${savedLanguage}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } else {
      // Detecção automática do idioma do navegador (CA04)
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("en")) {
        finalLanguage = "en";
      } else if (browserLang.startsWith("es")) {
        finalLanguage = "es";
      } else {
        finalLanguage = "pt";
      }

      localStorage.setItem("spam-language", finalLanguage);
      if (typeof document !== "undefined") {
        document.cookie = `spam-language=${finalLanguage}; path=/; max-age=31536000; SameSite=Lax`;
      }
      currentModuleLanguage = finalLanguage;
      setLanguageState(finalLanguage);

      // Exibir toast informativo
      const toastMsgs = {
        pt: "Definimos seu idioma como Português Brasileiro com base nas configurações do seu navegador. Você pode alterá-lo nas configurações de perfil.",
        en: "We set your language to English automatically based on your browser settings. You can change it at any time in your profile.",
        es: "Hemos configurado su idioma a Español automáticamente según la configuración de su navegador. Puede cambiarlo en su perfil."
      };
      
      setTimeout(() => {
        showPremiumToast(toastMsgs[finalLanguage], "success");
      }, 1000);
    }

    // Carregar configurações de tema customizado (RF53)
    const savedCustomThemes = localStorage.getItem("spam-custom-themes");
    if (savedCustomThemes) {
      try {
        setCustomThemes(JSON.parse(savedCustomThemes));
      } catch (e) {
        console.error("Erro ao carregar temas salvos:", e);
      }
    }

    const savedActiveCustomTheme = localStorage.getItem("spam-active-custom-theme");
    if (savedActiveCustomTheme) {
      try {
        const themeObj = JSON.parse(savedActiveCustomTheme);
        setActiveCustomTheme(themeObj);
        
        // Injetar variáveis CSS imediatamente para evitar flicker visual (CA02)
        const root = window.document.documentElement;
        root.setAttribute("data-custom-theme", "true");
        
        const primaryHsl = hexToHsl(themeObj.colors.primary).str;
        const successHsl = hexToHsl(themeObj.colors.success).str;
        const alertHsl = hexToHsl(themeObj.colors.alert).str;
        const warningHsl = hexToHsl("#f59e0b").str;

        root.style.setProperty("--theme-primary-hsl", primaryHsl);
        root.style.setProperty("--theme-success-hsl", successHsl);
        root.style.setProperty("--theme-alert-hsl", alertHsl);
        root.style.setProperty("--theme-warning-hsl", warningHsl);
      } catch (e) {
        console.error("Erro ao carregar tema customizado ativo:", e);
      }
    }

    const savedUser = sessionStorage.getItem("spam-user");
    let initialUser: User | null = null;
    if (savedUser) {
      try {
        initialUser = JSON.parse(savedUser);
        setCurrentUser(initialUser);
        
        if (initialUser && initialUser.language) {
          finalLanguage = initialUser.language;
          currentModuleLanguage = initialUser.language;
          setLanguageState(initialUser.language);
          localStorage.setItem("spam-language", initialUser.language);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário salvo:", e);
      }
    }

    const savedTheme = localStorage.getItem("spam-theme") as "light" | "dark" | "auto" | null;
    let finalTheme: "light" | "dark" | "auto" = "dark";
    
    if (savedTheme === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const detectedTheme = prefersDark ? "dark" : "light";
      finalTheme = detectedTheme;
      localStorage.setItem("spam-theme", detectedTheme);
      
      // Aplicar imediatamente a classe no html para evitar flicker visual
      const root = window.document.documentElement;
      if (detectedTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      
      const modeLabel = detectedTheme === "dark" ? "Escuro" : "Claro";
      setTimeout(() => {
        showPremiumToast(
          `Detectamos a preferência do seu sistema operacional e aplicamos o modo ${modeLabel} automaticamente.`,
          "success"
        );
      }, 500);
    } else {
      const userTheme = initialUser?.theme;
      finalTheme = userTheme || savedTheme || "dark";
    }
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

    const savedPrivacyText = localStorage.getItem("spam-privacy-notice-text");
    if (savedPrivacyText) {
      setPrivacyNoticeText(savedPrivacyText);
    } else {
      const defaultText = "Aviso de Privacidade (LGPD): Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), informamos que os dados importados serão utilizados exclusivamente para fins de análise preditiva neste sistema, garantindo a sua confidencialidade. Não haverá qualquer compartilhamento ou transferência de informações pessoais com terceiros. Para mais detalhes sobre seus direitos e tratamentos efetuados, consulte nossa Política de Privacidade. Caso tenha dúvidas, entre em contato com nosso Encarregado pelo tratamento de dados pessoais (DPO) através do e-mail: dpo@empresa.com.";
      setPrivacyNoticeText(defaultText);
      localStorage.setItem("spam-privacy-notice-text", defaultText);
    }

    const savedSelectedAlgs = localStorage.getItem("spam-selected-algorithms");
    let currentSelectedAlgs = {
      maintenance: "Random Forest",
      demand: "Random Forest",
      churn: "Random Forest",
      "credit-risk": "Random Forest"
    };
    if (savedSelectedAlgs) {
      try {
        const parsed = JSON.parse(savedSelectedAlgs);
        setSelectedAlgorithmsState(parsed);
        currentSelectedAlgs = parsed;
      } catch (e) {
        console.error("Erro ao carregar algoritmos selecionados:", e);
      }
    }

    // Carregar e Validar Modelos (CA04)
    const cleanedModels: Record<DomainType, Record<string, TrainedModel | null>> = {
      maintenance: { "Random Forest": null, "Regressão Linear": null },
      demand: { "Random Forest": null, "Regressão Linear": null },
      churn: { "Random Forest": null, "Regressão Logística": null },
      "credit-risk": { "Random Forest": null, "Regressão Logística": null }
    };

    const savedTrainedModelsByAlg = localStorage.getItem("spam-trained-models-by-algorithm");
    if (savedTrainedModelsByAlg) {
      try {
        const parsed = JSON.parse(savedTrainedModelsByAlg);
        (Object.keys(parsed) as DomainType[]).forEach(d => {
          if (parsed[d]) {
            Object.keys(parsed[d]).forEach(alg => {
              const model = parsed[d][alg];
              if (model) {
                // Verificar se faltam propriedades críticas para atestar integridade
                if (!model.metrics || !model.algorithm || !model.modelId || !model.domain || typeof model.metrics !== "object") {
                  integrityErrorFound = true;
                  if (!failedDomains.includes(d)) {
                    failedDomains.push(d);
                  }
                } else {
                  cleanedModels[d][alg] = model;
                }
              }
            });
          }
        });

        setTrainedModelsByAlgorithm(cleanedModels);

        // Atualizar também o trainedModels baseado no algoritmo selecionado
        setTrainedModels(prev => {
          const next = { ...prev };
          (Object.keys(currentSelectedAlgs) as DomainType[]).forEach(d => {
            const selectedAlg = currentSelectedAlgs[d];
            next[d] = cleanedModels[d]?.[selectedAlg] || null;
          });
          return next;
        });

        if (integrityErrorFound) {
          localStorage.setItem("spam-trained-models-by-algorithm", JSON.stringify(cleanedModels));
        }
      } catch (e) {
        console.error("Erro ao carregar modelos por algoritmo:", e);
      }
    }

    // Carregar limiares
    const savedThresholds = localStorage.getItem("spam-alert-thresholds");
    if (savedThresholds) {
      try {
        setAlertThresholds(JSON.parse(savedThresholds));
      } catch (e) {
        console.error("Erro ao carregar limiares de alerta:", e);
      }
    }

    // Carregar configurações de e-mail (RF41)
    const savedEmailConfig = localStorage.getItem("spam-email-notifications");
    if (savedEmailConfig) {
      try {
        setEmailConfig(JSON.parse(savedEmailConfig));
      } catch (e) {
        console.error("Erro ao carregar configurações de e-mail:", e);
      }
    }

    const savedGlossary = localStorage.getItem("spam-glossary");
    if (savedGlossary) {
      try {
        setGlossary(JSON.parse(savedGlossary));
      } catch (e) {
        console.error("Erro ao carregar glossário:", e);
        setGlossary(DEFAULT_GLOSSARY);
      }
    } else {
      setGlossary(DEFAULT_GLOSSARY);
      localStorage.setItem("spam-glossary", JSON.stringify(DEFAULT_GLOSSARY));
    }
    isGlossaryInitialized.current = true;

    const savedTrash = localStorage.getItem("spam-trash");
    if (savedTrash) {
      try {
        setTrashItems(JSON.parse(savedTrash));
      } catch {
        setTrashItems(DEFAULT_TRASH);
      }
    } else {
      setTrashItems(DEFAULT_TRASH);
      localStorage.setItem("spam-trash", JSON.stringify(DEFAULT_TRASH));
    }
    isTrashInitialized.current = true;

    let loadedAlerts: Alert[] = [];
    const savedAlerts = localStorage.getItem("spam-alerts");
    if (savedAlerts) {
      try {
        loadedAlerts = JSON.parse(savedAlerts);
        setAlerts(loadedAlerts);
      } catch (e) {
        console.error("Erro ao carregar alertas:", e);
        setAlerts([]);
      }
    } else {
      loadedAlerts = [
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
      localStorage.setItem("spam-alerts", JSON.stringify(loadedAlerts));
    }
    isAlertsInitialized.current = true;
    setIsAuthLoading(false);

    // Carregar histórico de predições
    const savedPredictionHistory = localStorage.getItem("spam-prediction-history");
    if (savedPredictionHistory) {
      try {
        setPredictionHistory(JSON.parse(savedPredictionHistory));
      } catch (e) {
        console.error("Erro ao carregar histórico de predições:", e);
      }
    } else {
      const initialHistory: PredictionHistoryRecord[] = [
        {
          id: "PRED-MNT-1",
          domain: "maintenance",
          timestamp: Date.now() - 3600000 * 2,
          item: "Prensa Hidráulica 04 (M04)",
          predictionResult: "Falha Iminente (89%)",
          details: { "Vibração RMS": "8.5 mm/s" }
        },
        {
          id: "PRED-CRD-1",
          domain: "credit-risk",
          timestamp: Date.now() - 3600000 * 24,
          item: "PROP-801 (Cliente Alpha)",
          predictionResult: "Aprovar",
          details: { "Score": 850 }
        }
      ];
      setPredictionHistory(initialHistory);
      localStorage.setItem("spam-prediction-history", JSON.stringify(initialHistory));
    }
    isPredictionHistoryInitialized.current = true;

    // Carregar logs de auditoria
    let loadedLogsList = MOCK_LOGS;
    const storedLogs = localStorage.getItem("spam-audit-logs");
    if (storedLogs) {
      try {
        const parsedLogs = JSON.parse(storedLogs);
        if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
          loadedLogsList = parsedLogs;
        }
      } catch (e) {
        console.error("Erro ao carregar logs de auditoria:", e);
      }
    } else {
      localStorage.setItem("spam-audit-logs", JSON.stringify(MOCK_LOGS));
    }

    // Processar erros de integridade (CA04)
    if (integrityErrorFound) {
      failedDomains.forEach(domain => {
        const integrityAlertId = `ALT-SYS-INTEGRITY-${domain}-${Date.now()}`;
        const hasIntegrityAlert = loadedAlerts.some(a => a.id.startsWith(`ALT-SYS-INTEGRITY-${domain}`));
        if (!hasIntegrityAlert) {
          const newAlert: Alert = {
            id: integrityAlertId,
            domain: domain,
            item: `Modelo Preditivo (${DOMAINS[domain]?.name || domain})`,
            value: "Falha de Integridade Estrutural",
            metric: "Propriedades críticas ausentes",
            criticality: "high",
            timestamp: Date.now(),
            recognized: false
          };
          loadedAlerts = [newAlert, ...loadedAlerts];
        }

        const integrityLogMessage = `[Model Integrity Error] Modelo salvo corrompido ou incompleto detectado no localStorage para o domínio '${domain}'. Cache limpo. Novo treinamento sugerido.`;
        const hasIntegrityLog = loadedLogsList.some(l => l.action === integrityLogMessage);
        if (!hasIntegrityLog) {
          const newLog: AuditLog = {
            id: Math.random().toString(36).substring(2, 9).toUpperCase(),
            profile: "Sistema",
            username: "Sistema",
            accessProfile: "Sistema",
            timestamp: Date.now(),
            action: integrityLogMessage
          };
          loadedLogsList = [newLog, ...loadedLogsList];
        }
      });

      localStorage.setItem("spam-alerts", JSON.stringify(loadedAlerts));
      localStorage.setItem("spam-audit-logs", JSON.stringify(loadedLogsList));
    }

    // Carregar agendamentos (RF42)
    const loadedSchedules: Record<DomainType, SchedulingConfig | null> = {
      maintenance: null,
      demand: null,
      churn: null,
      "credit-risk": null
    };
    const scheduleDomains: DomainType[] = ["maintenance", "demand", "churn", "credit-risk"];
    scheduleDomains.forEach(d => {
      const saved = localStorage.getItem(`spam-schedule-${d}`);
      if (saved) {
        try {
          loadedSchedules[d] = JSON.parse(saved);
        } catch (e) {
          console.error(`Erro ao carregar agendamento do domínio ${d}:`, e);
        }
      }
    });
    setSchedules(loadedSchedules);

    setAlerts(loadedAlerts);
    setLogs(loadedLogsList);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("spam-trained-models", JSON.stringify(trainedModels));
  }, [trainedModels]);

  useEffect(() => {
    localStorage.setItem("spam-trained-models-by-algorithm", JSON.stringify(trainedModelsByAlgorithm));
  }, [trainedModelsByAlgorithm]);

  useEffect(() => {
    localStorage.setItem("spam-models-history", JSON.stringify(modelsHistory));
  }, [modelsHistory]);

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

  const savePrivacyNoticeText = useCallback((text: string) => {
    setPrivacyNoticeText(text);
    localStorage.setItem("spam-privacy-notice-text", text);
  }, []);

  const queueEmailNotification = useCallback((
    domain: DomainType,
    alertItem: { item: string; value: string | number; threshold: number; timestamp: number }
  ) => {
    if (!emailConfig.email) return;

    if (!emailBufferRef.current[domain]) {
      emailBufferRef.current[domain] = {
        alerts: [],
        timerId: null
      };
    }

    const buffer = emailBufferRef.current[domain];
    buffer.alerts.push(alertItem);

    if (buffer.timerId) {
      clearTimeout(buffer.timerId);
    }

    buffer.timerId = setTimeout(() => {
      const alertsToSend = [...buffer.alerts];
      buffer.alerts = [];
      buffer.timerId = null;

      if (alertsToSend.length === 0) return;

      const emailId = `EML-${domain.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;
      
      const newEmail: SimulatedEmail = {
        id: emailId,
        recipient: emailConfig.email,
        domain: domain,
        timestamp: Date.now(),
        alerts: alertsToSend
      };

      setSentEmails(prev => [newEmail, ...prev]);

      // Registrar no Log de Auditoria Técnica global do sistema (CA06)
      const valuesStr = alertsToSend.map(a => a.value).join(", ");
      const itemsStr = alertsToSend.map(a => a.item).join(", ");
      
      const newLog = {
        id: `LOG-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
        profile: "Sistema",
        username: "Sistema",
        accessProfile: "Sistema",
        timestamp: Date.now(),
        action: `[Email Sent] E-mail de notificação enviado para ${emailConfig.email} (Domínio: ${DOMAINS[domain].name}) contendo ${alertsToSend.length} alerta(s) crítico(s). Itens: [${itemsStr}]. Valores: [${valuesStr}].`
      };
      setLogs((prev) => {
        const next = [newLog, ...prev];
        localStorage.setItem("spam-audit-logs", JSON.stringify(next));
        return next;
      });
    }, 2000);
  }, [emailConfig.email]);

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

    // Interceptar alertas críticos para envio de e-mail (RF41)
    if (newAlertData.criticality === "high" && emailConfig.email) {
      const isEnabled = emailConfig.enabledDomains[newAlertData.domain];
      if (isEnabled) {
        queueEmailNotification(newAlert.domain, {
          item: newAlert.item,
          value: newAlert.value,
          threshold: alertThresholds[newAlert.domain],
          timestamp: newAlert.timestamp
        });
      }
    }
  }, [addLog, emailConfig, alertThresholds, queueEmailNotification]);

  const updateEmailConfig = useCallback((config: EmailNotificationsConfig) => {
    setEmailConfig(config);
    localStorage.setItem("spam-email-notifications", JSON.stringify(config));
    showPremiumToast("Configurações de e-mail salvas com sucesso!", "success");
    addLog(`[Config Update] Configurações de notificação por e-mail atualizadas (Destinatário: ${config.email}).`);
  }, [addLog]);

  const clearSentEmails = useCallback(() => {
    setSentEmails([]);
  }, []);

  const simulateCriticalAlertsBatch = useCallback(() => {
    if (!emailConfig.email) {
      showPremiumToast("Por favor, configure e salve seu e-mail no perfil antes de rodar o teste.", "error");
      return;
    }

    showPremiumToast("Disparando 3 alertas críticos fictícios simultâneos para simulação em lote...", "success");

    const mockAlerts = [
      {
        domain: "maintenance" as DomainType,
        item: "Turbina Hidráulica T-800",
        value: "Vibração: 7.8 mm/s",
        metric: "Vibração RMS",
        criticality: "high" as const
      },
      {
        domain: "maintenance" as DomainType,
        item: "Gerador de Energia G-20",
        value: "Temperatura: 95°C",
        metric: "Temperatura Estator",
        criticality: "high" as const
      },
      {
        domain: "maintenance" as DomainType,
        item: "Compressor de Ar C-10",
        value: "Pressão: 12.4 bar",
        metric: "Pressão Manométrica",
        criticality: "high" as const
      }
    ];

    mockAlerts.forEach(alert => {
      addAlert(alert);
    });
  }, [addAlert, emailConfig.email]);

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

  useEffect(() => {
    if (!isGlossaryInitialized.current) return;
    localStorage.setItem("spam-glossary", JSON.stringify(glossary));
  }, [glossary]);

  const addGlossaryTerm = useCallback((term: Omit<GlossaryTerm, "id">) => {
    const newTerm: GlossaryTerm = {
      ...term,
      id: Math.random().toString(36).substring(2, 9).toUpperCase()
    };
    setGlossary(prev => {
      const next = [...prev, newTerm].sort((a, b) => a.term.localeCompare(b.term));
      return next;
    });
    addLog(`[Glossário] Novo termo adicionado: '${term.term}' na categoria '${term.category}'.`);
  }, [addLog]);

  const updateGlossaryTerm = useCallback((id: string, term: Omit<GlossaryTerm, "id">) => {
    setGlossary(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...term } : t);
      return next.sort((a, b) => a.term.localeCompare(b.term));
    });
    addLog(`[Glossário] Termo atualizado: '${term.term}'.`);
  }, [addLog]);

  const deleteGlossaryTerm = useCallback((id: string) => {
    let termName = "";
    setGlossary(prev => {
      const term = prev.find(t => t.id === id);
      if (term) termName = term.term;
      return prev.filter(t => t.id !== id);
    });
    if (termName) {
      addLog(`[Glossário] Termo excluído permanentemente: '${termName}'.`);
    }
  }, [addLog]);

  const getGlossaryTerm = useCallback((id: string) => {
    return glossary.find(t => t.id === id);
  }, [glossary]);

  useEffect(() => {
    if (!isTrashInitialized.current) return;
    localStorage.setItem("spam-trash", JSON.stringify(trashItems));
  }, [trashItems]);

  const restoreTrashItems = useCallback((ids: string[]) => {
    setTrashItems(prev => prev.filter(item => !ids.includes(item.id)));
    addLog(`[Lixeira] ${ids.length} item(ns) restaurado(s) com sucesso.`);
  }, [addLog]);

  const deleteTrashItemsPermanently = useCallback((ids: string[]) => {
    setTrashItems(prev => prev.filter(item => !ids.includes(item.id)));
    addLog(`[Lixeira] ${ids.length} item(ns) excluído(s) permanentemente.`);
  }, [addLog]);

  const emptyTrash = useCallback(() => {
    setTrashItems([]);
    addLog("[Lixeira] A lixeira foi esvaziada completamente.");
  }, [addLog]);

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

  const startTraining = useCallback((fileSize: number, rowCount: number, _rowsData?: string[][], datasetName?: string) => {
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
    const algStr = selectedAlgorithms[domainKey] || "Random Forest";

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
          if (algStr === "Random Forest") {
            modelMetrics = {
              accuracy: 0.962 + Math.random() * 0.02,
              precision: 0.951 + Math.random() * 0.03,
              recall: 0.945 + Math.random() * 0.02,
              f1Score: 0.952 + Math.random() * 0.02,
              aucRoc: 0.965 + Math.random() * 0.02,
            };
            hyperparams = {
              n_estimators: 100,
              max_depth: 10,
              min_samples_split: 2,
              random_state: 42
            };
          } else { // Regressão Logística
            modelMetrics = {
              accuracy: 0.921 + Math.random() * 0.03,
              precision: 0.915 + Math.random() * 0.03,
              recall: 0.902 + Math.random() * 0.03,
              f1Score: 0.908 + Math.random() * 0.03,
              aucRoc: 0.931 + Math.random() * 0.03,
            };
            hyperparams = {
              penalty: "l2",
              C: 1.0,
              solver: "lbfgs",
              max_iter: 1000
            };
          }

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
          if (algStr === "Random Forest") {
            modelMetrics = {
              r2: 0.941 + Math.random() * 0.03,
              rmse: 1.25 + Math.random() * 0.5,
              mae: 0.95 + Math.random() * 0.3,
            };
            hyperparams = {
              n_estimators: 100,
              max_depth: 12,
              min_samples_split: 2,
              random_state: 42
            };
          } else { // Regressão Linear
            modelMetrics = {
              r2: 0.865 + Math.random() * 0.04,
              rmse: 2.15 + Math.random() * 0.6,
              mae: 1.65 + Math.random() * 0.4,
            };
            hyperparams = {
              fit_intercept: true,
              copy_X: true,
              n_jobs: -1
            };
          }

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

        const historyLength = modelsHistory[domainKey]?.length || 0;
        const newVersion = `v${historyLength + 1}`;

        const baseModel = {
            modelId,
            domain: domainKey,
            version: newVersion,
            datasetName: datasetName || "dataset_analitico.csv",
            datasetSize: fileSizeKB,
            algorithm: algStr,
            type: isClassification ? "Classification" : "Regression" as "Classification" | "Regression",
            metrics: modelMetrics,
            hyperparameters: hyperparams,
            trainSize,
            testSize,
            datasetVersion: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}`,
            timestamp: Date.now(),
            confusionMatrix: confusionMatrixData,
            residuals: residualsData
        };

        const newModel: TrainedModel = {
            ...baseModel,
            type: baseModel.type,
            hash: generateModelHash(baseModel as Omit<TrainedModel, "hash">)
        };

        // CA05: Simule uma validação de integridade estrutural do bloco gerado antes do disparo do download.
        const isIntegrityValid = validateModelIntegrity(newModel);
        if (!isIntegrityValid) {
          if (trainingIntervalRef.current) clearInterval(trainingIntervalRef.current);
          setIsTraining(false);
          setTrainingProgress(0);
          setTrainingStep("");
          setTrainingETA(0);
          setTrainingDuration(0);
          setTrainingFinishedAlert(false);
          alert("Erro de Validação de Integridade: O objeto de metadados do modelo está corrompido ou incompleto. Salvamento cancelado. Por favor, realize um novo treinamento.");
          return;
        }

        // CA05 (RF12) - Save active model to previous model history before updating
        setPreviousTrainedModels(prev => ({
          ...prev,
          [domainKey]: trainedModels[domainKey]
        }));

        setTrainedModels(prev => ({
          ...prev,
          [domainKey]: newModel
        }));

        setTrainedModelsByAlgorithm(prev => {
            const updated = {
              ...prev,
              [domainKey]: {
                ...(prev[domainKey] || {}),
                [algStr]: newModel
              }
            };
            return updated;
          });

          setModelsHistory(prev => ({
            ...prev,
            [domainKey]: [newModel, ...(prev[domainKey] || [])]
          }));

          addLog(`[Model Training] Novo modelo (${algStr}) treinado com sucesso para '${DOMAINS[domainKey].name}'. ID: ${modelId}`);

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
        addLogWithProfile(userProfile, `Treinamento realizado no domínio ${DOMAINS[domainKey].name} utilizando o algoritmo ${algStr}`);

        // CA01, CA02, CA04 & CA06: Download automático do JSON e auditoria
        try {
          const today = new Date();
          const yyyy = today.getFullYear();
          const mm = String(today.getMonth() + 1).padStart(2, "0");
          const dd = String(today.getDate()).padStart(2, "0");
          const formattedDate = `${yyyy}-${mm}-${dd}`;
          const fileName = `modelo-${domainKey}-${formattedDate}.json`;

          const downloadPayload = {
            ...newModel,
            totalRecords: trainSize + testSize
          };

          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadPayload, null, 2));
          const downloadAnchor = document.createElement("a");
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", fileName);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();

          showPremiumToast(`Modelo exportado com sucesso no domínio: ${DOMAINS[domainKey].name}`);

          addLogWithProfile(
            userProfile,
            `Arquivo de modelo exportado com sucesso no domínio ${DOMAINS[domainKey].name} utilizando o algoritmo ${algStr}`
          );
        } catch (downloadErr) {
          console.error("Erro ao gerar download automático do modelo:", downloadErr);
        }
      }
    }, 1000);
  }, [activeDomain, simulatedFail, addLog, isTraining, trainedModels, archiveRetrainingCycle, selectedAlgorithms, setTrainedModelsByAlgorithm, addLogWithProfile, userProfile, modelsHistory]);

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

  const applyCustomTheme = useCallback((themeObj: CustomTheme | null) => {
    setActiveCustomTheme(themeObj);
    const root = document.documentElement;
    if (themeObj) {
      localStorage.setItem("spam-active-custom-theme", JSON.stringify(themeObj));
      root.setAttribute("data-custom-theme", "true");
      
      const primaryHsl = hexToHsl(themeObj.colors.primary).str;
      const successHsl = hexToHsl(themeObj.colors.success).str;
      const alertHsl = hexToHsl(themeObj.colors.alert).str;
      const warningHsl = hexToHsl("#f59e0b").str;

      root.style.setProperty("--theme-primary-hsl", primaryHsl);
      root.style.setProperty("--theme-success-hsl", successHsl);
      root.style.setProperty("--theme-alert-hsl", alertHsl);
      root.style.setProperty("--theme-warning-hsl", warningHsl);
    } else {
      localStorage.removeItem("spam-active-custom-theme");
      root.setAttribute("data-custom-theme", "false");
      root.style.removeProperty("--theme-primary-hsl");
      root.style.removeProperty("--theme-success-hsl");
      root.style.removeProperty("--theme-alert-hsl");
      root.style.removeProperty("--theme-warning-hsl");
    }
  }, []);

  const saveCustomTheme = useCallback((name: string, colors: CustomThemeColors) => {
    const newTheme: CustomTheme = {
      id: `theme-${Math.random().toString(36).substring(2, 9)}`,
      name,
      colors
    };
    
    setCustomThemes(prev => {
      const next = [...prev.filter(t => t.name !== name), newTheme];
      localStorage.setItem("spam-custom-themes", JSON.stringify(next));
      return next;
    });

    showPremiumToast(`Tema "${name}" salvo com sucesso!`, "success");
  }, []);

  const deleteCustomTheme = useCallback((id: string) => {
    setCustomThemes(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem("spam-custom-themes", JSON.stringify(next));
      return next;
    });
    
    setActiveCustomTheme(prev => {
      if (prev && prev.id === id) {
        localStorage.removeItem("spam-active-custom-theme");
        const root = document.documentElement;
        root.setAttribute("data-custom-theme", "false");
        root.style.removeProperty("--theme-primary-hsl");
        root.style.removeProperty("--theme-success-hsl");
        root.style.removeProperty("--theme-alert-hsl");
        root.style.removeProperty("--theme-warning-hsl");
        return null;
      }
      return prev;
    });

    showPremiumToast("Tema removido com sucesso!", "success");
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    if (!key) return "";
    const dictionary = translations[language] as Record<string, string>;
    let text = "";
    
    if (dictionary && dictionary[key]) {
      text = dictionary[key];
    } else {
      // fallback to pt
      const fallbackDict = translations["pt"] as Record<string, string>;
      if (fallbackDict && fallbackDict[key]) {
        text = fallbackDict[key];
      } else {
        if (key.includes('_')) {
          const clean = key.replace(/_/g, ' ');
          text = clean.charAt(0).toUpperCase() + clean.slice(1);
        } else {
          text = key.charAt(0).toUpperCase() + key.slice(1);
        }
      }
    }

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v);
      });
    }
    return text;
  }, [language]);

  const getDomainName = useCallback((type: DomainType): string => {
    switch (type) {
      case "maintenance":
        return t("maintenance_name");
      case "demand":
        return t("demand_name");
      case "churn":
        return t("churn_name");
      case "credit-risk":
        return t("credit_risk_name");
      default:
        return "";
    }
  }, [t]);

  // --- LOGICA DE AGENDAMENTO DE PREVISOES PERIODICAS (RF42) ---

  const runScheduledTrigger = useCallback((domain: DomainType) => {
    const startTime = Date.now();
    const algStr = selectedAlgorithms[domain] || "Random Forest";
    const isClassification = algStr === "Random Forest" || algStr === "Gradient Boosting" || algStr === "Support Vector Machine";
    const typeStr = isClassification ? "Classification" : "Regression";

    addLogWithProfile("Sistema", `[Scheduled Execution] Iniciando processamento automático agendado para o domínio '${DOMAINS[domain].name}'.`);

    if (simulatedFail) {
      const endTime = Date.now();
      const errorMsg = "Ausência de dados mínimos para processamento periódico ou falha crítica simulada (OOM).";
      
      const newLog: AuditLog = {
        id: `LOG-SCH-ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
        profile: "Sistema",
        username: "Mecanismo de Agendamento",
        accessProfile: "Mecanismo de Agendamento",
        timestamp: Date.now(),
        action: `[Scheduled Execution Failure] Domínio: ${DOMAINS[domain].name}. Início: ${new Date(startTime).toLocaleString("pt-BR")}, Fim: ${new Date(endTime).toLocaleString("pt-BR")}. Resultado: Falha. Erro: ${errorMsg}`
      };
      
      setLogs(prev => {
        const next = [newLog, ...prev];
        localStorage.setItem("spam-audit-logs", JSON.stringify(next));
        return next;
      });

      const emailId = `EML-SCH-ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;
      const newEmail: SimulatedEmail = {
        id: emailId,
        recipient: emailConfig.email || "gestor@empresa.com",
        domain,
        timestamp: Date.now(),
        alerts: [],
        isScheduledReport: true,
        scheduleStatus: "failure",
        completionTime: new Date(endTime).toLocaleTimeString("pt-BR"),
        errorDescription: errorMsg
      };
      setSentEmails(prev => [newEmail, ...prev]);

      addLogWithProfile("Sistema", `[Email Sent] Relatório de falha de agendamento enviado para ${emailConfig.email || "gestor@empresa.com"}.`);
      showPremiumToast(`Falha no agendamento de ${DOMAINS[domain].name} (Mecanismo fallback ativo)`, "error");
    } else {
      const modelId = `SPAM-MODEL-SCH-${isClassification ? "CLS" : "REG"}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;
      const trainSize = 120 + Math.floor(Math.random() * 80);
      const testSize = 30 + Math.floor(Math.random() * 20);

      let modelMetrics: TrainedModel["metrics"] = {};
      if (isClassification) {
        modelMetrics = {
          accuracy: 0.94 + Math.random() * 0.04,
          precision: 0.93 + Math.random() * 0.04,
          recall: 0.92 + Math.random() * 0.04,
          f1Score: 0.93 + Math.random() * 0.03,
          aucRoc: 0.95 + Math.random() * 0.03,
        };
      } else {
        modelMetrics = {
          r2: 0.89 + Math.random() * 0.08,
          rmse: 1.4 + Math.random() * 0.6,
          mae: 1.0 + Math.random() * 0.4,
        };
      }

      const historyLength = modelsHistory[domain]?.length || 0;
      const newVersion = `v${historyLength + 1}`;

      const baseModel = {
        modelId,
        domain,
        version: newVersion,
        datasetName: "agendamento_automatico.csv",
        datasetSize: 512,
        algorithm: algStr,
        type: typeStr as "Classification" | "Regression",
        metrics: modelMetrics,
        hyperparameters: isClassification 
          ? { n_estimators: 100, max_depth: 8, random_state: 42 } 
          : { n_estimators: 100, max_depth: 10, random_state: 42 },
        trainSize,
        testSize,
        datasetVersion: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}`,
        timestamp: Date.now()
      };

      const newModel: TrainedModel = {
        ...baseModel,
        type: baseModel.type,
        hash: generateModelHash(baseModel as Omit<TrainedModel, "hash">)
      };

      setPreviousTrainedModels(prev => ({
        ...prev,
        [domain]: trainedModels[domain]
      }));

      setTrainedModels(prev => ({
        ...prev,
        [domain]: newModel
      }));

      setTrainedModelsByAlgorithm(prev => {
        const updated = {
          ...prev,
          [domain]: {
            ...(prev[domain] || {}),
            [algStr]: newModel
          }
        };
        localStorage.setItem("spam-trained-models-by-algorithm", JSON.stringify(updated));
        return updated;
      });

      const newCycle: RetrainingCycle = {
        modelId,
        timestamp: newModel.timestamp,
        algorithm: newModel.algorithm,
        hyperparameters: newModel.hyperparameters,
        metrics: newModel.metrics,
        trainSize: newModel.trainSize,
        testSize: newModel.testSize
      };
      
      setHyperparameterHistory(prev => {
        const currentList = prev[domain] || [];
        const updatedList = [newCycle, ...currentList];
        const nextHistory = {
          ...prev,
          [domain]: updatedList
        };
        localStorage.setItem("spam-hyperparameter-history", JSON.stringify(nextHistory));
        return nextHistory;
      });

      setDashboardStatus(prev => ({
        ...prev,
        [domain]: {
          ...prev[domain],
          isModelTrained: true,
          lastPredictionDate: new Date().toISOString(),
          recentActivities: [
            { id: Math.random().toString(), description: "Treinamento agendado concluído", timestamp: new Date().toISOString(), type: "training" },
            ...prev[domain].recentActivities
          ]
        }
      }));

      const predRecord: Omit<PredictionHistoryRecord, "id" | "timestamp"> = {
        domain,
        item: isClassification 
          ? (domain === "churn" ? "Clientes VIP (Agendamento)" : "Propostas de Crédito (Agendamento)") 
          : (domain === "maintenance" ? "Telemetria Sensores (Agendamento)" : "Séries Temporais Demanda (Agendamento)"),
        predictionResult: isClassification
          ? (domain === "churn" ? "Risco de Churn Atualizado" : "Crédito Avaliado Automaticamente")
          : (domain === "maintenance" ? "RUL Estimado Automaticamente" : "Previsão de Estoque Concluída"),
        details: isClassification 
          ? { Acurácia: modelMetrics.accuracy?.toFixed(4) || "0" } 
          : { R2: modelMetrics.r2?.toFixed(4) || "0" }
      };

      const newRecord: PredictionHistoryRecord = {
        ...predRecord,
        id: `PRED-SCH-${domain.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
        timestamp: Date.now(),
      };
      setPredictionHistory(prev => [newRecord, ...prev]);

      const endTime = Date.now();
      const newLog = {
        id: `LOG-SCH-OK-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`,
        profile: "Sistema",
        username: "Mecanismo de Agendamento",
        accessProfile: "Mecanismo de Agendamento",
        timestamp: Date.now(),
        action: `[Scheduled Execution Success] Domínio: ${DOMAINS[domain].name}. Início: ${new Date(startTime).toLocaleString("pt-BR")}, Fim: ${new Date(endTime).toLocaleString("pt-BR")}. Modelo ID: ${modelId}, Algoritmo: ${algStr}. Resultado: Sucesso.`
      };
      
      setLogs(prev => {
        const next = [newLog, ...prev];
        localStorage.setItem("spam-audit-logs", JSON.stringify(next));
        return next;
      });

      const emailId = `EML-SCH-OK-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now()}`;
      const newEmail: SimulatedEmail = {
        id: emailId,
        recipient: emailConfig.email || "gestor@empresa.com",
        domain,
        timestamp: Date.now(),
        alerts: [],
        isScheduledReport: true,
        scheduleStatus: "success",
        completionTime: new Date(endTime).toLocaleTimeString("pt-BR"),
        metricsSummary: {
          accuracy: modelMetrics.accuracy,
          r2: modelMetrics.r2,
          f1Score: modelMetrics.f1Score,
          rmse: modelMetrics.rmse
        }
      };
      setSentEmails(prev => [newEmail, ...prev]);

      addLogWithProfile("Sistema", `[Email Sent] Relatório de sucesso de agendamento enviado para ${emailConfig.email || "gestor@empresa.com"}.`);
      showPremiumToast(`Agendamento de ${DOMAINS[domain].name} executado com sucesso!`, "success");
    }
  }, [selectedAlgorithms, simulatedFail, emailConfig.email, trainedModels, addLogWithProfile, modelsHistory]);

  const saveSchedule = useCallback((domain: DomainType, config: Omit<SchedulingConfig, "domain">) => {
    const fullConfig: SchedulingConfig = {
      ...config,
      domain
    };
    setSchedules(prev => {
      const next = { ...prev, [domain]: fullConfig };
      localStorage.setItem(`spam-schedule-${domain}`, JSON.stringify(fullConfig));
      return next;
    });
    showPremiumToast(`Agendamento salvo com sucesso!`, "success");
    addLog(`[Schedule Config] Agendamento configurado para o domínio '${DOMAINS[domain].name}' (Frequência: ${config.frequency}, Horário: ${config.startTime}).`);
  }, [addLog]);

  const deleteSchedule = useCallback((domain: DomainType) => {
    setSchedules(prev => {
      const next = { ...prev, [domain]: null };
      localStorage.removeItem(`spam-schedule-${domain}`);
      return next;
    });
    showPremiumToast(`Agendamento removido.`, "success");
    addLog(`[Schedule Config] Agendamento removido para o domínio '${DOMAINS[domain].name}'.`);
  }, [addLog]);

  // Background Scheduling Validator Loop (RF42)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Monday, 7 = Sunday
      const currentDayOfMonth = now.getDate();

      (Object.keys(schedules) as DomainType[]).forEach(domain => {
        const config = schedules[domain];
        if (!config || !config.isActive) return;

        // Parse start time (HH:MM)
        const [schHours, schMinutes] = config.startTime.split(":").map(Number);
        if (schHours !== currentHours || schMinutes !== currentMinutes) return;

        // Check frequency specific criteria
        if (config.frequency === "weekly" && config.specificDay !== currentDayOfWeek) return;
        if (config.frequency === "monthly" && config.specificDay !== currentDayOfMonth) return;

        // Avoid double runs within the same minute (60 seconds)
        if (config.lastRun && Date.now() - config.lastRun < 60000) return;

        // Trigger execution
        // Update config lastRun time
        const updatedConfig = { ...config, lastRun: Date.now() };
        setSchedules(prev => {
          const next = { ...prev, [domain]: updatedConfig };
          localStorage.setItem(`spam-schedule-${domain}`, JSON.stringify(updatedConfig));
          return next;
        });

        // Run scheduled task
        runScheduledTrigger(domain);
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [schedules, runScheduledTrigger]);

  const setLanguage = useCallback((lang: LanguageType) => {
    setLanguageState(lang);
    currentModuleLanguage = lang;
    localStorage.setItem("spam-language", lang);
    if (typeof document !== "undefined") {
      document.cookie = `spam-language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // Salvar preferência de idioma no perfil de usuário logado (CA03)
    if (currentUser) {
      const updatedUser = { ...currentUser, language: lang };
      setCurrentUser(updatedUser);
      sessionStorage.setItem("spam-user", JSON.stringify(updatedUser));

      setUsers((prevUsers) => {
        const nextUsers = prevUsers.map((u) => 
          u.username === currentUser.username ? { ...u, language: lang } : u
        );
        localStorage.setItem("spam-users", JSON.stringify(nextUsers));
        return nextUsers;
      });
    }

    const logMsgs = {
      pt: `Idioma alterado para Português.`,
      en: `Language changed to English.`,
      es: `Idioma cambiado a Español.`
    };
    addLogWithProfile(userProfile, logMsgs[lang] || `Idioma alterado para ${lang}`);
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
        theme: user.theme || "dark",
        language: user.language || language
      };
      
      if (user.language) {
        setLanguage(user.language);
      }
      
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
  }, [isUserLocked, addLogWithProfile, setUsers, language, setLanguage]);

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
      setCurrentView("monitoring");
    } else if (pathname === "/") {
      setActiveDomain(null);
      setCurrentView("monitoring");
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

  const setSelectedAlgorithm = useCallback((domain: DomainType, algorithm: string) => {
    setSelectedAlgorithmsState(prev => {
      const next = { ...prev, [domain]: algorithm };
      localStorage.setItem("spam-selected-algorithms", JSON.stringify(next));
      return next;
    });

    setTrainedModels(prev => {
      const next = { ...prev };
      const model = trainedModelsByAlgorithm[domain]?.[algorithm] || null;
      next[domain] = model;
      return next;
    });
  }, [trainedModelsByAlgorithm]);

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

  const setModelActive = useCallback((domain: DomainType, modelId: string) => {
    const history = modelsHistory[domain] || [];
    const modelToActivate = history.find(m => m.modelId === modelId);
    
    if (modelToActivate) {
      const activeVersion = trainedModels[domain]?.version || "Desconhecida";
      setPreviousTrainedModels(prev => ({ ...prev, [domain]: trainedModels[domain] }));
      setTrainedModels(prev => ({ ...prev, [domain]: modelToActivate }));
      setTrainedModelsByAlgorithm(prev => ({
        ...prev,
        [domain]: {
          ...(prev[domain] || {}),
          [modelToActivate.algorithm]: modelToActivate
        }
      }));
      setSelectedAlgorithm(domain, modelToActivate.algorithm);
      addLog(`[Auditoria - Versionamento] O usuário ${currentUser?.fullName || userProfile} realizou rollback no domínio '${DOMAINS[domain].name}'. Versão substituída (anterior): ${activeVersion} -> Versão restaurada (ativa): ${modelToActivate.version} (${modelToActivate.algorithm}). Substituição concluída.`);
    }
  }, [modelsHistory, trainedModels, setSelectedAlgorithm, addLog, currentUser, userProfile]);

  // ==========================================
  // RF48 - GERENCIAMENTO DE BACKUPS AUTOMÁTICOS
  // ==========================================
  
  const createBackup = useCallback(async (type: "auto" | "manual") => {
    // Collect all data to backup
    const snapshot = {
      users: DEFAULT_USERS, // Safe default mock
      logs: logs,
      privacyText: privacyNoticeText,
      selectedAlgs: selectedAlgorithms,
      trainedModels: trainedModels,
      trainedModelsByAlg: trainedModelsByAlgorithm,
      modelsHistory: modelsHistory,
      thresholds: alertThresholds,
      emailConfig: emailConfig,
      glossary: glossary,
      trash: trashItems,
      alerts: alerts,
      predictionHistory: predictionHistory,
      schedules: schedules
    };

    const content = JSON.stringify(snapshot);
    const sizeBytes = new Blob([content]).size;
    const timestamp = Date.now();
    const id = `bkp_${timestamp}_${Math.random().toString(36).substring(2, 9)}`;
    const hash = await sha256(content);

    const newBackup: SystemBackup = {
      id,
      timestamp,
      type,
      content,
      hash,
      sizeBytes,
      integrityStatus: "valid" 
    };

    setSystemBackups(prev => {
      let updated = [newBackup, ...prev];
      if (updated.length > backupConfig.maxBackups) {
        addLog(`[Backup Automático] Limite de retenção atingido (${backupConfig.maxBackups}). Excluindo backup mais antigo.`);
        updated = updated.slice(0, backupConfig.maxBackups);
      }
      localStorage.setItem("spam-system-backups", JSON.stringify(updated));
      return updated;
    });

    addLog(`[Auditoria - Backup] Backup ${type === 'auto' ? 'automático' : 'manual'} gerado com sucesso. Hash: ${hash.substring(0, 8)}...`);
    showPremiumToast(`Backup ${type === 'auto' ? 'Automático' : 'Manual'} gerado com sucesso!`, "success");
    
  }, [logs, privacyNoticeText, selectedAlgorithms, trainedModels, trainedModelsByAlgorithm, modelsHistory, alertThresholds, emailConfig, glossary, trashItems, alerts, predictionHistory, schedules, backupConfig.maxBackups, addLog]);

  const restoreBackup = useCallback(async (id: string) => {
    const backup = systemBackups.find(b => b.id === id);
    if (!backup) return;
    
    try {
      const currentHash = await sha256(backup.content);
      if (currentHash !== backup.hash) {
        showPremiumToast("A integridade do backup falhou! O conteúdo foi alterado.", "error");
        addLog(`[Alerta de Segurança] Tentativa de restauração falhou por hash corrompido no backup ${id}.`);
        return;
      }

      const snapshot = JSON.parse(backup.content);
      
      // Override states
      setLogs(snapshot.logs || []);
      setPrivacyNoticeText(snapshot.privacyText || "");
      setSelectedAlgorithmsState(snapshot.selectedAlgs || { maintenance: "Random Forest", demand: "Prophet", churn: "XGBoost", "credit-risk": "Regressão Logística" });
      setTrainedModels(snapshot.trainedModels || {});
      setTrainedModelsByAlgorithm(snapshot.trainedModelsByAlg || {});
      setModelsHistory(snapshot.modelsHistory || {});
      setAlertThresholds(snapshot.thresholds || DEFAULT_THRESHOLDS);
      setEmailConfig(snapshot.emailConfig || { email: "", enabledDomains: { maintenance: true, demand: true, churn: true, "credit-risk": true } });
      setGlossary(snapshot.glossary || []);
      setTrashItems(snapshot.trash || []);
      setAlerts(snapshot.alerts || []);
      setPredictionHistory(snapshot.predictionHistory || []);
      setSchedules(snapshot.schedules || { maintenance: null, demand: null, churn: null, "credit-risk": null });

      // Save everything to localStorage
      localStorage.setItem("spam-audit-logs", JSON.stringify(snapshot.logs));
      localStorage.setItem("spam-privacy-notice-text", snapshot.privacyText);
      localStorage.setItem("spam-selected-algorithms", JSON.stringify(snapshot.selectedAlgs));
      localStorage.setItem("spam-trained-models", JSON.stringify(snapshot.trainedModels));
      localStorage.setItem("spam-trained-models-by-algorithm", JSON.stringify(snapshot.trainedModelsByAlg));
      localStorage.setItem("spam-models-history", JSON.stringify(snapshot.modelsHistory));
      localStorage.setItem("spam-alert-thresholds", JSON.stringify(snapshot.thresholds));
      localStorage.setItem("spam-email-notifications", JSON.stringify(snapshot.emailConfig));
      localStorage.setItem("spam-glossary", JSON.stringify(snapshot.glossary));
      localStorage.setItem("spam-trash", JSON.stringify(snapshot.trash));
      localStorage.setItem("spam-alerts", JSON.stringify(snapshot.alerts));
      localStorage.setItem("spam-prediction-history", JSON.stringify(snapshot.predictionHistory));
      
      addLog(`[Auditoria - Restauração] O sistema foi restaurado para o estado do backup do dia ${new Date(backup.timestamp).toLocaleString()}.`);
      showPremiumToast("Sistema restaurado com sucesso!", "success");
      
    } catch (_e) {
      console.error(_e);
      showPremiumToast("Erro fatal ao restaurar o backup.", "error");
    }
  }, [systemBackups, addLog, setLogs, setPrivacyNoticeText, setSelectedAlgorithmsState, setTrainedModels, setTrainedModelsByAlgorithm, setModelsHistory, setAlertThresholds, setEmailConfig, setGlossary, setTrashItems, setAlerts, setPredictionHistory, setSchedules]);

  const deleteBackup = useCallback((id: string) => {
    setSystemBackups(prev => {
      const updated = prev.filter(b => b.id !== id);
      localStorage.setItem("spam-system-backups", JSON.stringify(updated));
      return updated;
    });
    addLog(`[Auditoria - Backup] Backup ${id} removido manualmente.`);
    showPremiumToast("Backup excluído permanentemente.", "success");
  }, [addLog]);

  const updateBackupConfig = useCallback((config: BackupConfig) => {
    setBackupConfig(config);
    localStorage.setItem("spam-backup-config", JSON.stringify(config));
    addLog(`[Auditoria - Configuração] Política de backup atualizada: reter ${config.maxBackups} arquivos, frequência ${config.frequency}.`);
    showPremiumToast("Configurações de backup salvas.", "success");
  }, [addLog]);

  // Verificação periódica para auto backups (CA01)
  useEffect(() => {
    if (backupConfig.frequency === "none") return;
    
    const checkInterval = setInterval(() => {
      setSystemBackups(currentBackups => {
        const lastAuto = currentBackups.find(b => b.type === "auto");
        const now = Date.now();
        
        let shouldBackup = false;
        if (!lastAuto) {
          shouldBackup = true;
        } else {
          const timeDiff = now - lastAuto.timestamp;
          const DAY = 24 * 60 * 60 * 1000;
          if (backupConfig.frequency === "daily" && timeDiff > DAY) shouldBackup = true;
          if (backupConfig.frequency === "weekly" && timeDiff > 7 * DAY) shouldBackup = true;
          if (backupConfig.frequency === "monthly" && timeDiff > 30 * DAY) shouldBackup = true;
        }
        
        if (shouldBackup) {
          createBackup("auto");
        }
        return currentBackups;
      });
    }, 60000);
    
    return () => clearInterval(checkInterval);
  }, [backupConfig.frequency, createBackup]);

  // Load backups on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBackups = localStorage.getItem("spam-system-backups");
      if (savedBackups) {
        try {
          const parsed = JSON.parse(savedBackups);
          setSystemBackups(parsed);
        } catch {
          console.error("Corrupted backups");
        }
      }
      
      const savedConfig = localStorage.getItem("spam-backup-config");
      if (savedConfig) {
        try {
          setBackupConfig(JSON.parse(savedConfig));
        } catch {}
      }
    }
  }, []);

  // RF57: Tutorial Methods
  const startTutorial = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("spam-tutorial-completed");
    }
    setTutorialState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 1,
      isPaused: false,
      isCompleted: false
    }));
    addLog("[Tutorial] Usuário iniciou o tutorial interativo.");
  }, [addLog]);

  const pauseTutorial = useCallback(() => {
    setTutorialState(prev => {
      addLog(`[Tutorial] Usuário pausou o tutorial na etapa ${prev.currentStep}.`);
      return { ...prev, isPaused: true };
    });
  }, [addLog]);

  const resumeTutorial = useCallback(() => {
    setTutorialState(prev => {
      addLog(`[Tutorial] Usuário retomou o tutorial na etapa ${prev.currentStep}.`);
      return { ...prev, isPaused: false };
    });
  }, [addLog]);

  const endTutorial = useCallback(() => {
    setTutorialState(prev => {
      addLog(`[Tutorial] Tutorial encerrado. Etapas concluídas: ${prev.currentStep - 1}/${prev.totalSteps}.`);
      if (typeof window !== "undefined") {
        localStorage.setItem("spam-tutorial-completed", "true");
      }
      return { ...prev, isActive: false, isCompleted: true, currentStep: 0 };
    });
  }, [addLog]);

  const advanceTutorialStep = useCallback((expectedStep: number) => {
    setTutorialState(prev => {
      if (!prev.isActive || prev.isPaused) return prev;
      if (prev.currentStep === expectedStep) {
        const nextStep = prev.currentStep + 1;
        if (nextStep > prev.totalSteps) {
          addLog("[Tutorial] Usuário concluiu todas as etapas do tutorial com sucesso.");
          if (typeof window !== "undefined") {
            localStorage.setItem("spam-tutorial-completed", "true");
          }
          return { ...prev, currentStep: nextStep, isActive: false, isCompleted: true };
        }
        return { ...prev, currentStep: nextStep };
      }
      return prev;
    });
  }, [addLog]);

  // RF57: Auto-start on first login (CA01)
  useEffect(() => {
    if (currentUser && typeof window !== "undefined") {
      const hasCompleted = localStorage.getItem("spam-tutorial-completed");
      if (!hasCompleted && !tutorialState.isActive && !tutorialState.isCompleted) {
        startTutorial();
      }
    }
  }, [currentUser, tutorialState.isActive, tutorialState.isCompleted, startTutorial]);


  return (
    <DomainContext.Provider
      value={{
        currentView,
        setCurrentView,
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
        addLogWithProfile,
        privacyNoticeText,
        savePrivacyNoticeText,
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
        selectedAlgorithms,
        setSelectedAlgorithm,
        trainedModelsByAlgorithm,
        modelsHistory,
        setModelActive,
        emailConfig,
        updateEmailConfig,
        sentEmails,
        clearSentEmails,
        showPremiumToast,
        simulateCriticalAlertsBatch,
        activeCustomTheme,
        customThemes,
        applyCustomTheme,
        saveCustomTheme,
        deleteCustomTheme,
        language,
        setLanguage,
        t,
        getDomainName,
        activeProfileSection,
        setActiveProfileSection,
        activeProfileSubSection,
        setActiveProfileSubSection,

        glossary,
        addGlossaryTerm,
        updateGlossaryTerm,
        deleteGlossaryTerm,
        getGlossaryTerm,
        trashItems,
        restoreTrashItems,
        deleteTrashItemsPermanently,
        emptyTrash,

        schedules,
        saveSchedule,
        deleteSchedule,
        runScheduledTrigger,

        systemBackups,
        backupConfig,
        createBackup,
        restoreBackup,
        deleteBackup,
        updateBackupConfig,
        tutorialState,
        startTutorial,
        pauseTutorial,
        resumeTutorial,
        endTutorial,
        advanceTutorialStep,
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
