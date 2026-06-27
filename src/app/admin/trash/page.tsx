"use client";

import React, { useState } from "react";
import { 
  Trash2, 
  RefreshCcw, 
  Search, 
  Filter, 
  FileText, 
  Database, 
  AlertCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DeletedItem = {
  id: string;
  name: string;
  type: "Dataset" | "Modelo" | "Análise";
  deletedAt: string;
  deletedBy: string;
  size: string;
};

const initialItems: DeletedItem[] = [
  { id: "1", name: "base_clientes_2023_v1.csv", type: "Dataset", deletedAt: "2026-06-25T14:30:00", deletedBy: "admin@spam.com", size: "45 MB" },
  { id: "2", name: "modelo_churn_xgb_antigo", type: "Modelo", deletedAt: "2026-06-24T09:15:00", deletedBy: "joao.silva", size: "120 MB" },
  { id: "3", name: "relatorio_risco_q1.pdf", type: "Análise", deletedAt: "2026-06-20T16:45:00", deletedBy: "maria.souza", size: "2.4 MB" },
  { id: "4", name: "historico_transacoes_bruto", type: "Dataset", deletedAt: "2026-06-15T11:20:00", deletedBy: "admin@spam.com", size: "1.2 GB" },
];

export default function TrashPage() {
  const [items, setItems] = useState<DeletedItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestore = (id: string, name: string) => {
    setItems(items.filter(item => item.id !== id));
    showToast(`"${name}" foi restaurado com sucesso.`);
  };

  const handlePermanentDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir permanentemente "${name}"? Esta ação não pode ser desfeita.`)) {
      setItems(items.filter(item => item.id !== id));
      showToast(`"${name}" foi excluído permanentemente.`);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.type.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Dataset": return <Database className="h-4 w-4 text-blue-500" />;
      case "Modelo": return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case "Análise": return <FileText className="h-4 w-4 text-emerald-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Fake Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <RefreshCcw className="h-4 w-4" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trash2 className="h-8 w-8 text-destructive" />
            Lixeira
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e recupere dados, modelos ou análises excluídos acidentalmente. Itens são mantidos por 30 dias.
          </p>
        </div>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Esvaziar Lixeira
        </Button>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardHeader className="pb-3 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-96">
            <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
            <Input 
              placeholder="Buscar itens excluídos..." 
              className="pl-9 bg-background/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
              <Trash2 className="h-12 w-12 mb-3 opacity-20" />
              <p>Nenhum item encontrado na lixeira.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Nome do Item</th>
                    <th className="px-6 py-4 font-medium">Tipo</th>
                    <th className="px-6 py-4 font-medium">Tamanho</th>
                    <th className="px-6 py-4 font-medium">Excluído Por</th>
                    <th className="px-6 py-4 font-medium">Data de Exclusão</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.size}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.deletedBy}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(item.deletedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() => handleRestore(item.id, item.name)}
                          title="Restaurar Item"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handlePermanentDelete(item.id, item.name)}
                          title="Excluir Permanentemente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
