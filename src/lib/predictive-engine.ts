/**
 * Motor Preditivo Local - Manutenção de Equipamentos
 * Lógica de estimativa de RUL (Remaining Useful Life) e classificação de riscos.
 */

export interface MachineTelemetry {
  id: string;
  name: string;
  temp: number;
  vibration: number;
  oee: number;
}

export interface PredictiveRulResult {
  rul: number;
  status: "ok" | "warning" | "critical";
}

// Vidas úteis de base calibradas para cada máquina para bater com os valores nominais do sistema
export const BASE_RULS: Record<string, number> = {
  "M01": 308.0,   // Torno CNC 01: nominal (58°C, 1.2mm/s, 88% OEE) -> ~184 horas
  "M02": 500.0,   // Braço Robotizado A: nominal (62°C, 2.1mm/s, 84% OEE) -> ~230 horas
  "M03": 763.0,   // Esteira Transportadora: nominal (45°C, 0.8mm/s, 91% OEE) -> ~620 horas
  "M04": 142.5,   // Prensa Hidráulica 04: nominal (78°C, 4.8mm/s, 73% OEE) -> ~22 horas
};

/**
 * Calcula dinamicamente a Vida Útil Restante (RUL) baseada nas variáveis físicas.
 * 
 * Lógica matemática:
 * - Fator Temperatura: Degradado conforme excede 40°C
 * - Fator Vibração: Degradado conforme excede 0.5 mm/s
 * - Fator OEE: Proporcional linearmente
 */
export function calculateMachineRUL(
  machineId: string,
  temp: number,
  vibration: number,
  oee: number
): PredictiveRulResult {
  const baseRul = BASE_RULS[machineId] || 300.0;

  // Fator de Temperatura: Penalização linear/exponencial a partir de 40°C
  const tempFactor = Math.max(0.1, 1 - Math.max(0, temp - 40) / 70);

  // Fator de Vibração: Penalização linear/exponencial a partir de 0.5 mm/s
  const vibFactor = Math.max(0.05, 1 - Math.max(0, vibration - 0.5) / 8);

  // Fator de OEE: Linear
  const oeeFactor = oee / 100;

  // Cálculo final do RUL (em horas)
  const rul = Math.max(0, baseRul * tempFactor * vibFactor * oeeFactor);

  // Classificação do status de risco
  let status: "ok" | "warning" | "critical" = "ok";
  if (temp > 80 || vibration > 4.5) {
    status = "critical";
  } else if (temp > 70 || vibration > 3.0 || oee < 80) {
    status = "warning";
  }

  return { rul, status };
}

export interface CreditRiskTelemetry {
  propostaId: string;
  cliente: string;
  valor: number;
  score: number;
}

export interface CreditRiskPredictionResult {
  probabilidadeRetorno: number;
  acao: "Aprovar" | "Análise Manual" | "Revisar Garantia" | "Rejeitar";
}

/**
 * Calcula a probabilidade de retorno de crédito e a ação sugerida.
 */
export function predictCreditRisk(
  valor: number,
  score: number
): CreditRiskPredictionResult {
  // Deterministic but realistic prediction rules based on score and loan value
  let probabilidadeRetorno = 0;
  
  if (score >= 800) {
    probabilidadeRetorno = Math.min(100, Math.round(92 + (score - 800) * 0.04));
  } else if (score >= 700) {
    probabilidadeRetorno = Math.round(80 + (score - 700) * 0.12);
  } else if (score >= 600) {
    probabilidadeRetorno = Math.round(65 + (score - 600) * 0.15);
  } else if (score >= 500) {
    probabilidadeRetorno = Math.round(45 + (score - 500) * 0.2);
  } else {
    probabilidadeRetorno = Math.max(5, Math.round((score / 500) * 45));
  }

  // Adjust by amount (valor): higher amount reduces probability of return for lower score categories
  if (valor > 250000 && score < 750) {
    probabilidadeRetorno = Math.max(5, probabilidadeRetorno - 6);
  }
  if (valor > 600000 && score < 700) {
    probabilidadeRetorno = Math.max(5, probabilidadeRetorno - 12);
  }

  let acao: "Aprovar" | "Análise Manual" | "Revisar Garantia" | "Rejeitar" = "Rejeitar";
  if (score >= 750) {
    acao = "Aprovar";
  } else if (score >= 600) {
    acao = "Análise Manual";
  } else if (score >= 500) {
    acao = "Revisar Garantia";
  } else {
    acao = "Rejeitar";
  }

  return { probabilidadeRetorno, acao };
}

export interface PredictionResult {
  status: string;
  predicted: boolean;
  domain: string;
  params: Record<string, number>;
}

export async function getPrediction(domain: string, params: Record<string, number>): Promise<PredictionResult> {
  // Simulação de predição isolada
  return { status: "success", predicted: true, domain, params };
}

// ----------------------------------------------------------------------
// BATCH PREDICTION UTILS (RF63)
// ----------------------------------------------------------------------

export function batchProcessChurnRisk(row: Record<string, string>) {
  const ltvNum = parseFloat(row.ltv?.replace(/\D/g, "") || "0");
  const rand = Math.random();
  const score = rand * 100;
  let result = "Retido";
  let resultClass = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
  
  if (ltvNum < 50000 || score > 80) {
    result = "Alto Risco de Churn";
    resultClass = "text-rose-500 bg-rose-500/10 border border-rose-500/20";
  } else if (score > 40) {
    result = "Atenção (Risco Médio)";
    resultClass = "text-amber-500 bg-amber-500/10 border border-amber-500/20";
  }

  return { result, resultClass, score };
}

export function batchProcessCreditRisk(row: Record<string, string>) {
  const scoreInput = parseInt(row.score || "500", 10);
  const valInput = parseFloat(row.valor?.replace(/\D/g, "") || "0");
  const base = predictCreditRisk(valInput, scoreInput);
  
  let resultClass = "text-amber-500 bg-amber-500/10 border border-amber-500/20";
  if (base.acao === "Aprovar") {
    resultClass = "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
  } else if (base.acao === "Rejeitar") {
    resultClass = "text-rose-500 bg-rose-500/10 border border-rose-500/20";
  }

  return {
    result: base.acao,
    resultClass,
    score: base.probabilidadeRetorno
  };
}

// ----------------------------------------------------------------------
// ADVANCED ANALYTICS MOCKS (RF60, RF74, RF75, RF85, RF86, RF90)
// ----------------------------------------------------------------------

export function getMockCrossValidationScores() {
  // RF60
  return [
    { fold: "Fold 1", accuracy: 92.5, f1: 91.2 },
    { fold: "Fold 2", accuracy: 93.1, f1: 92.0 },
    { fold: "Fold 3", accuracy: 89.8, f1: 88.5 },
    { fold: "Fold 4", accuracy: 94.2, f1: 93.1 },
    { fold: "Fold 5", accuracy: 91.5, f1: 90.8 },
  ];
}

export function getMockLiftAndGainsCurves() {
  // RF74, RF75
  const data = [];
  let cumulativeGainsModel = 0;
  
  for (let i = 10; i <= 100; i += 10) {
    // Model captures more targets early on
    let gainIncrement = 0;
    if (i <= 30) gainIncrement = 20;
    else if (i <= 60) gainIncrement = 10;
    else gainIncrement = 2.5;
    
    cumulativeGainsModel += gainIncrement;
    const gainRandom = i; // random baseline is just % of sample
    
    data.push({
      percentile: `${i}%`,
      modelGains: Math.min(100, cumulativeGainsModel),
      randomGains: gainRandom,
      modelLift: (Math.min(100, cumulativeGainsModel) / gainRandom).toFixed(2),
      randomLift: 1.0,
    });
  }
  return data;
}

export function getMockShapValues(domain: string) {
  // RF85
  if (domain === "churn") {
    return [
      { feature: "Dias desde o último login", importance: 0.35, impact: "Positivo (Aumenta Risco)" },
      { feature: "Tickets de Suporte", importance: 0.25, impact: "Positivo" },
      { feature: "NPS Resposta", importance: 0.20, impact: "Negativo (Reduz Risco)" },
      { feature: "Tempo de Contrato", importance: 0.12, impact: "Negativo" },
      { feature: "Funcionalidades Premium", importance: 0.08, impact: "Negativo" },
    ];
  }
  return [
    { feature: "Score SPC/Serasa", importance: 0.40, impact: "Negativo (Reduz Risco)" },
    { feature: "Valor Solicitado", importance: 0.25, impact: "Positivo (Aumenta Risco)" },
    { feature: "Renda Mensal", importance: 0.15, impact: "Negativo" },
    { feature: "Atrasos Anteriores", importance: 0.15, impact: "Positivo" },
    { feature: "Idade", importance: 0.05, impact: "Neutro" },
  ];
}

export function getMockDataDrift() {
  // RF86
  return [
    { month: "Jan", psi: 0.02 },
    { month: "Fev", psi: 0.03 },
    { month: "Mar", psi: 0.05 },
    { month: "Abr", psi: 0.04 },
    { month: "Mai", psi: 0.09 },
    { month: "Jun", psi: 0.14 }, // starting to drift
  ];
}

export function getMockFairnessAnalysis() {
  // RF90
  return [
    { group: "Norte/Nordeste", fpr: 4.2, fnr: 3.8 },
    { group: "Sul/Sudeste", fpr: 4.0, fnr: 4.1 },
    { group: "PMEs", fpr: 5.1, fnr: 4.5 },
    { group: "Grandes Contas", fpr: 3.5, fnr: 3.0 },
  ];
}


