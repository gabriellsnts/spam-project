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
