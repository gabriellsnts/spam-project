"use client";

import React, { useState } from "react";
import { BookA, Search, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: "Geral" | "Machine Learning" | "Métricas";
};

const glossaryData: GlossaryTerm[] = [
  { id: "1", term: "Churn Rate", definition: "A taxa de cancelamento de clientes em um determinado período. Representa a porcentagem de assinantes que deixaram de usar o serviço.", category: "Métricas" },
  { id: "2", term: "OEE (Overall Equipment Effectiveness)", definition: "Eficiência Global do Equipamento. É uma métrica padrão ouro para medir a produtividade de manufatura, combinando Disponibilidade, Desempenho e Qualidade.", category: "Geral" },
  { id: "3", term: "VaR (Value at Risk)", definition: "Valor em Risco. Uma medida estatística usada para quantificar o nível de risco financeiro em um portfólio, empresa ou investimento em um período específico.", category: "Métricas" },
  { id: "4", term: "Overfitting", definition: "Quando um modelo de machine learning se ajusta muito bem aos dados de treinamento, mas perde a capacidade de generalizar para dados novos e não vistos.", category: "Machine Learning" },
  { id: "5", term: "Underfitting", definition: "Quando um modelo é simples demais e não consegue capturar a relação subjacente nos dados de treinamento, apresentando baixa precisão tanto no treino quanto no teste.", category: "Machine Learning" },
  { id: "6", term: "NPS (Net Promoter Score)", definition: "Métrica de lealdade do cliente que mede a disposição dos clientes em recomendar os produtos ou serviços da empresa para outros.", category: "Métricas" },
  { id: "7", term: "Feature Engineering", definition: "Processo de usar o conhecimento do domínio para extrair características (features) dos dados brutos e melhorar o desempenho dos algoritmos de aprendizado de máquina.", category: "Machine Learning" },
  { id: "8", term: "Data Lineage", definition: "Rastreabilidade do ciclo de vida dos dados, desde sua origem até os pontos onde são consumidos, detalhando as transformações que sofreram no caminho.", category: "Geral" },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");

  const filteredTerms = glossaryData.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookA className="h-8 w-8 text-sky-500" />
            Glossário Técnico
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulte o significado de métricas, termos de negócio e conceitos de inteligência artificial.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="relative w-full max-w-md">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
            <Input 
              placeholder="Buscar por termo ou definição..." 
              className="pl-9 bg-background/50 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <BookOpen className="h-12 w-12 mb-3 opacity-20" />
              <p>Nenhum termo encontrado para "{search}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTerms.map((item) => (
                <div key={item.id} className="group p-4 rounded-xl border border-border/50 bg-background/30 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-sky-500 transition-colors">
                      {item.term}
                    </h3>
                    <span className="text-[10px] font-medium px-2 py-1 bg-muted rounded-full text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
