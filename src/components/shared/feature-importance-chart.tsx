"use client";

import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2, Filter, ArrowDownAZ, ArrowDown10, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface FeatureData {
  name: string;
  weight: number;
  description: string;
}

interface FeatureImportanceChartProps {
  data: FeatureData[];
  title?: string;
  description?: string;
}

export function FeatureImportanceChart({
  data,
  title = "Importância das Variáveis (Feature Importance)",
  description = "Análise de impacto relativo das variáveis preditoras no modelo ativo.",
}: FeatureImportanceChartProps) {
  const [filterTop10, setFilterTop10] = useState(true);
  const [sortByWeight, setSortByWeight] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<FeatureData | null>(null);

  const processedData = useMemo(() => {
    let result = [...data];

    if (sortByWeight) {
      result.sort((a, b) => b.weight - a.weight);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (filterTop10 && sortByWeight) {
      result = result.slice(0, 10);
    } else if (filterTop10 && !sortByWeight) {
        const top10 = [...data].sort((a, b) => b.weight - a.weight).slice(0, 10);
        result = top10.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [data, filterTop10, sortByWeight]);

  return (
    <Card className="bg-card border-border transition-colors duration-300">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-muted-foreground/60" />
            {title}
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterTop10(!filterTop10)}
            className="h-8 text-[10px] font-medium px-2 gap-1.5"
          >
            <Filter className="h-3 w-3" />
            {filterTop10 ? "Mostrar Todas" : "Mostrar Top 10"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortByWeight(!sortByWeight)}
            className="h-8 text-[10px] font-medium px-2 gap-1.5"
          >
            {sortByWeight ? <ArrowDownAZ className="h-3 w-3" /> : <ArrowDown10 className="h-3 w-3" />}
            {sortByWeight ? "Ordenar A-Z" : "Ordenar por Peso"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "currentColor", opacity: 0.8 }}
                width={120}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as FeatureData;
                    return (
                      <div className="bg-popover border border-border shadow-lg rounded-lg p-3 text-sm max-w-[200px]">
                        <p className="font-bold text-foreground mb-1">{data.name}</p>
                        <p className="text-muted-foreground text-xs mb-2">Peso: {(data.weight * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-muted-foreground italic line-clamp-3">Clique na barra para detalhes.</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="weight"
                radius={[0, 4, 4, 0]}
                onClick={(data) => setSelectedFeature(data as FeatureData)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="currentColor" className="text-primary" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Detalhes da Variável
            </DialogTitle>
            <DialogDescription>
              Compreenda a contribuição deste fator no modelo preditivo.
            </DialogDescription>
          </DialogHeader>
          {selectedFeature && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">{selectedFeature.name}</h4>
                <div className="text-xs text-muted-foreground">
                  Peso Relativo: <strong className="text-foreground">{(selectedFeature.weight * 100).toFixed(2)}%</strong>
                </div>
              </div>
              <div className="bg-muted/40 p-4 rounded-lg border border-border text-sm text-foreground/90 leading-relaxed">
                {selectedFeature.description}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
