"use client";

import React, { useState } from "react";
import { Book, ChevronDown, ChevronUp, Search, Activity, TrendingUp, Wrench, Package, HelpCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

interface DomainHelp {
  key: string;
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  description: string;
  faqs: FAQ[];
}

const DOMAINS_HELP: DomainHelp[] = [
  {
    key: "churn",
    label: "Retenção de Clientes (Churn)",
    icon: <Activity className="h-4 w-4" />,
    accentClass: "text-violet-400 border-violet-500/30 bg-violet-500/5",
    description: "Módulo de análise preditiva de probabilidade de cancelamento de assinaturas e contas Enterprise.",
    faqs: [
      { question: "O que é Churn Score?", answer: "É a probabilidade estimada de um cliente cancelar o serviço nos próximos 30 dias. Calculado com base em inatividade, tickets abertos, NPS e uso de funcionalidades premium. Valores acima de 80% indicam risco crítico." },
      { question: "Como interpretar a tabela de clientes?", answer: "Cada linha representa um cliente com seu Churn Score atual. Clientes em vermelho (>80%) precisam de ação imediata. Clique em uma linha para ver os fatores preditivos detalhados e a ação sugerida." },
      { question: "O que faz o botão 'Simular Churn em Massa'?", answer: "Simula um cenário hipotético de deterioração dos indicadores de todos os clientes simultaneamente, para testar os planos de contingência da equipe de Customer Success sem impactar dados reais." },
      { question: "O que é LTV?", answer: "Lifetime Value — valor total estimado que um cliente gerará durante todo o relacionamento com a empresa. Clientes com LTV alto e Churn Score alto devem ter prioridade máxima de retenção." },
      { question: "Como treinar um modelo de Churn?", answer: "Acesse a aba 'Calibração' dentro do módulo e importe um CSV com histórico de clientes. O sistema exige mínimo de 10 registros com as colunas: dias_inativo, tickets_abertos, nps, tempo_contrato_meses, uso_premium, churn (0/1)." },
      { question: "O que significa a Matriz de Confusão?", answer: "Mostra como o modelo classifica os clientes: Verdadeiros Positivos (churn previsto e real), Verdadeiros Negativos (retenção prevista e real), Falsos Positivos (churn previsto, mas cliente ficou) e Falsos Negativos (churn real, mas previsto como retido — o erro mais crítico)." },
    ],
  },
  {
    key: "credit-risk",
    label: "Risco de Crédito",
    icon: <TrendingUp className="h-4 w-4" />,
    accentClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
    description: "Análise preditiva de probabilidade de inadimplência e classificação de propostas de crédito.",
    faqs: [
      { question: "O que é o Score de Crédito no sistema?", answer: "Pontuação de 0 a 1000 que representa a capacidade de pagamento de um cliente. Scores acima de 750 indicam excelente histórico. Abaixo de 500, risco elevado de inadimplência. O motor preditivo usa score, valor solicitado e histórico para calcular a probabilidade de default." },
      { question: "O que significa 'Revisar Garantia'?", answer: "Ação recomendada quando a probabilidade de inadimplência é moderada. Indica que a proposta pode ser aprovada se o cliente apresentar garantias adicionais (imóveis, avalista, recebíveis)." },
      { question: "Como funciona o Teste de Estresse?", answer: "Simula um cenário macroeconômico adverso (crise, aumento de juros) e reavalia toda a carteira. Propostas 'Aprovadas' podem ser rebaixadas para 'Revisão Manual', permitindo antecipar provisões de capital." },
      { question: "O que é VaR (Value at Risk)?", answer: "Valor em Risco — estimativa da perda máxima esperada na carteira em um período específico, com um nível de confiança de 95%. Indica quanto capital precisa ser provisionado para cobrir perdas no cenário mais provável." },
      { question: "Como usar a Predição em Lote?", answer: "Carregue um arquivo CSV com as colunas proposta_id, cliente, valor, score. O sistema processa todas as linhas automaticamente e exibe o resultado (Aprovar/Rejeitar/Revisar) para cada proposta, com opção de exportar os resultados." },
      { question: "O que é F1-Score na Matriz de Confusão?", answer: "Média harmônica entre Precisão e Recall. Ideal para datasets desbalanceados (onde há muito mais 'não-inadimplentes' do que 'inadimplentes'). Um F1 acima de 80% indica bom equilíbrio entre detectar riscos reais sem gerar falsos alarmes." },
    ],
  },
  {
    key: "maintenance",
    label: "Manutenção Preditiva",
    icon: <Wrench className="h-4 w-4" />,
    accentClass: "text-amber-400 border-amber-500/30 bg-amber-500/5",
    description: "Monitoramento de telemetria de equipamentos e estimativa de Vida Útil Restante (RUL).",
    faqs: [
      { question: "O que é RUL (Remaining Useful Life)?", answer: "Vida Útil Restante — estimativa de quantas horas um equipamento pode operar antes de necessitar de manutenção corretiva. Calculado com base na temperatura, vibração e OEE atual. Equipamentos com RUL abaixo do limiar configurado geram alertas automáticos." },
      { question: "O que é OEE?", answer: "Overall Equipment Effectiveness (Eficiência Global do Equipamento) — combina Disponibilidade, Desempenho e Qualidade em um único indicador. OEE de 100% significa operação perfeita. Abaixo de 80%, o equipamento está abaixo do padrão industrial aceito." },
      { question: "Como funciona o Sandbox de Simulação?", answer: "Permite ajustar os parâmetros físicos (temperatura, vibração, OEE) de um equipamento específico de forma hipotética, sem alterar os dados reais de telemetria. O sistema recalcula o RUL e o status instantaneamente, gerando um relatório de impacto." },
      { question: "O que significa status 'Critical'?", answer: "O equipamento ultrapassou os limites de segurança da engenharia: temperatura acima de 80°C ou vibração acima de 4.5 mm/s. Indica falha iminente — a intervenção imediata é necessária para evitar dano catastrófico." },
      { question: "O que é Vibração RMS?", answer: "Root Mean Square da vibração — medida da energia de vibração de um equipamento ao longo do tempo. Valores acima de 3.0 mm/s indicam desbalanceamento mecânico ou desgaste de rolamentos, que são as causas mais comuns de falha em máquinas industriais." },
      { question: "Como treinar o modelo de Manutenção?", answer: "Importe um CSV com colunas: machine_id, temp (°C), vibration (mm/s), oee (%), failure (0/1). O sistema treina um modelo de regressão para estimar RUL personalizado por máquina." },
    ],
  },
  {
    key: "demand",
    label: "Previsão de Demanda",
    icon: <Package className="h-4 w-4" />,
    accentClass: "text-sky-400 border-sky-500/30 bg-sky-500/5",
    description: "Previsão de demanda por produto e análise de cobertura de estoque.",
    faqs: [
      { question: "O que é Lead Time?", answer: "Tempo total entre o pedido de reposição e a chegada do produto em estoque. Lead times longos aumentam o risco de ruptura. O sistema inclui o lead time no cálculo da cobertura de estoque para alertas mais precisos." },
      { question: "O que é Cobertura de Estoque?", answer: "Número de dias que o estoque atual consegue suprir a demanda média diária, sem novos pedidos. Cobertura abaixo do Lead Time significa que o produto ficará em falta antes da reposição chegar." },
      { question: "Como interpretar os produtos em alto risco?", answer: "Produtos marcados como 'Alto Risco' têm cobertura de estoque abaixo do lead time de reposição, ou seja, há probabilidade de ruptura. A ação recomendada é emitir um pedido de emergência imediatamente." },
      { question: "O que é o Índice de Sazonalidade?", answer: "Fator multiplicativo que ajusta a demanda prevista com base no histórico de variações sazonais (ex: picos no final de ano, baixas no inverno). Um índice de 1.3 indica que a demanda naquele período é 30% maior que a média anual." },
      { question: "Como funciona a previsão de demanda?", answer: "O sistema utiliza série temporal histórica de vendas para projetar a demanda futura. O modelo considera tendência de longo prazo, sazonalidade anual e eventos especiais configurados pelo usuário." },
      { question: "Como configurar um alerta de demanda?", answer: "Acesse as Configurações de Limiar neste módulo. Defina o percentual de desvio da demanda prevista que deve disparar um alerta (padrão: 15%). Alertas são registrados automaticamente no painel de notificações." },
    ],
  },
];

const GENERAL_FAQS: FAQ[] = [
  { question: "Como funciona o treinamento de modelos no SPAM?", answer: "Cada módulo de domínio possui uma aba 'Calibração' onde você pode importar um CSV histórico. O sistema treina um modelo determinístico baseado nos dados fornecidos e o armazena localmente no navegador. O modelo ativo é exibido com um badge verde na tela do módulo." },
  { question: "Os dados ficam armazenados onde?", answer: "Todos os dados (modelos treinados, histórico de predições, alertas, logs) são persistidos localmente no localStorage do seu navegador. Não há envio de dados para servidores externos. Para ambientes de produção, a integração com o backend real substituirá essa camada sem alterar a interface." },
  { question: "O que é o Modo Demo em componentes?", answer: "Botões 'Modo Demo' carregam dados pré-definidos para demonstração, sem necessidade de importar arquivos CSV. Ideal para apresentações e treinamento de equipes. Os dados são claramente marcados com um badge laranja 'DEMO'." },
  { question: "Como exportar relatórios?", answer: "Cada módulo possui um botão 'Exportar Relatório (PDF)' que utiliza a impressão do navegador. Gráficos e tabelas individuais têm opções de exportação em CSV ou SVG/PNG diretamente nos componentes." },
  { question: "O que são logs de auditoria?", answer: "Registro cronológico de todas as ações realizadas no sistema: logins, alertas disparados, modelos treinados, predições executadas. Acessíveis no painel de Administração por usuários com perfil Administrador." },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filterFaqs = (faqs: FAQ[]) => {
    if (!searchQuery) return faqs;
    const q = normalize(searchQuery);
    return faqs.filter((f) =>
      normalize(f.question).includes(q) || normalize(f.answer).includes(q)
    );
  };

  const domainsToShow = activeDomain
    ? DOMAINS_HELP.filter((d) => d.key === activeDomain)
    : DOMAINS_HELP;

  const showGeneral = !activeDomain;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/5 blur-3xl rounded-full" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-sky-500 font-bold text-xs uppercase tracking-widest">
            <HelpCircle className="h-4 w-4" />
            Central de Ajuda
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Documentação Integrada por Módulo
          </h2>
          <p className="text-muted-foreground text-xs">
            Perguntas frequentes e guias de uso para todos os módulos do SPAM System.
          </p>
        </div>
        <Link href="/docs/glossary">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 shrink-0">
            <Book className="h-3.5 w-3.5" />
            Glossário Completo
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
        <Input
          id="help-search"
          className="pl-9 bg-card border-border text-sm"
          placeholder="Buscar perguntas (ex: 'overfitting', 'exportar', 'CSV'...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Domain filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn("h-7 text-[11px]", !activeDomain && "bg-muted/40")}
          onClick={() => setActiveDomain(null)}
        >
          Todos os módulos
        </Button>
        {DOMAINS_HELP.map((d) => (
          <Button
            key={d.key}
            variant="outline"
            size="sm"
            className={cn("h-7 text-[11px] gap-1", activeDomain === d.key && "bg-muted/40")}
            onClick={() => setActiveDomain(activeDomain === d.key ? null : d.key)}
          >
            {d.icon}
            {d.label.split(" (")[0]}
          </Button>
        ))}
      </div>

      {/* General FAQs */}
      {showGeneral && (
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">Perguntas Gerais do Sistema</CardTitle>
            <CardDescription className="text-[11px]">Funcionalidades comuns a todos os módulos.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/30">
            {filterFaqs(GENERAL_FAQS).map((faq, i) => {
              const key = `general-${i}`;
              const isOpen = expandedFaq === key;
              return (
                <div key={key} className="py-3">
                  <button
                    className="w-full text-left flex items-center justify-between gap-3 group"
                    onClick={() => setExpandedFaq(isOpen ? null : key)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs font-semibold text-foreground group-hover:text-foreground/80 transition-colors">{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 animate-in slide-in-from-top-2 duration-200 pl-0">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Domain-specific FAQs */}
      {domainsToShow.map((domain) => {
        const filtered = filterFaqs(domain.faqs);
        if (searchQuery && filtered.length === 0) return null;
        return (
          <Card key={domain.key} className={cn("border bg-card/50", domain.accentClass.includes("border") ? "" : "border-border")}>
            <CardHeader className={cn("pb-3 border-b border-border/30 rounded-t-xl", domain.accentClass)}>
              <div className="flex items-center gap-2">
                {domain.icon}
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">{domain.label}</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">{domain.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border/30 p-0">
              {filtered.map((faq, i) => {
                const key = `${domain.key}-${i}`;
                const isOpen = expandedFaq === key;
                return (
                  <div key={key} className="px-5 py-3">
                    <button
                      className="w-full text-left flex items-center justify-between gap-3 group"
                      onClick={() => setExpandedFaq(isOpen ? null : key)}
                      aria-expanded={isOpen}
                    >
                      <span className="text-xs font-semibold text-foreground group-hover:text-foreground/80 transition-colors">{faq.question}</span>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-2 animate-in slide-in-from-top-2 duration-200">{faq.answer}</p>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && searchQuery && (
                <div className="px-5 py-4 text-xs text-muted-foreground">Nenhuma resposta encontrada para "{searchQuery}".</div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Footer link */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground mb-2">Precisa de mais detalhes sobre um termo específico?</p>
        <Link href="/docs/glossary">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Book className="h-3.5 w-3.5" />
            Acessar Glossário Completo de Termos
          </Button>
        </Link>
      </div>
    </div>
  );
}
