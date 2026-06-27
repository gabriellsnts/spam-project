"use client";

import React, { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle, FileWarning, CheckSquare, Square, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDomain } from "@/lib/context/domain-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function TrashPage() {
  const { trashItems, restoreTrashItems, deleteTrashItemsPermanently, emptyTrash, currentUser } = useDomain();
  
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modals state
  const [isConfirmEmptyOpen, setIsConfirmEmptyOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  
  // Feedback toast mock state
  const [toastMsg, setToastMsg] = useState<{title: string, desc: string, type: "success" | "error"} | null>(null);

  const isAdmin = currentUser?.accessProfile === "Super Admin";

  const filteredItems = trashItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.type.toLowerCase().includes(search.toLowerCase()) ||
    item.deletedBy.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const showToast = (title: string, desc: string, type: "success" | "error") => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRestore = (idsToRestore: string[]) => {
    if (!isAdmin) {
      showToast("Acesso Negado", "Apenas administradores podem restaurar itens.", "error");
      return;
    }
    restoreTrashItems(idsToRestore);
    setSelectedIds(new Set());
    showToast("Restaurado", `${idsToRestore.length} item(ns) restaurado(s) com sucesso.`, "success");
  };

  const handlePermanentDelete = () => {
    if (!isAdmin) return;
    deleteTrashItemsPermanently(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsConfirmDeleteOpen(false);
    showToast("Excluído", "Itens excluídos permanentemente.", "success");
  };

  const handleEmptyTrash = () => {
    if (!isAdmin) return;
    emptyTrash();
    setSelectedIds(new Set());
    setIsConfirmEmptyOpen(false);
    showToast("Lixeira Esvaziada", "Todos os itens foram removidos.", "success");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Toast Simulado */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border flex flex-col gap-1 min-w-[250px] animate-in slide-in-from-top-5 fade-in ${
          toastMsg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"
        }`}>
          <span className="font-bold text-sm">{toastMsg.title}</span>
          <span className="text-xs opacity-90">{toastMsg.desc}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Trash2 className="h-8 w-8 text-rose-500" />
            Lixeira
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Itens excluídos permanecem aqui por 30 dias antes da exclusão automática definitiva.
          </p>
        </div>

        {isAdmin && trashItems.length > 0 && (
          <Button 
            variant="destructive" 
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
            onClick={() => setIsConfirmEmptyOpen(true)}
          >
            <AlertTriangle className="h-4 w-4" />
            Esvaziar Lixeira
          </Button>
        )}
      </div>

      <Card className="bg-card/40 backdrop-blur border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/30 bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
              <FileWarning className="h-4 w-4 text-amber-500" />
              Itens Retidos ({trashItems.length})
            </CardTitle>
            <Input
              placeholder="Pesquisar itens excluídos..."
              className="max-w-xs h-9 bg-background/50 border-border/50 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {selectedIds.size > 0 && isAdmin && (
            <div className="mt-4 p-2 bg-sky-500/10 border border-sky-500/20 rounded-md flex items-center justify-between animate-in fade-in zoom-in-95">
              <span className="text-xs font-semibold text-sky-500 ml-2">
                {selectedIds.size} item(ns) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleRestore(Array.from(selectedIds))} className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white gap-1">
                  <RotateCcw className="h-3 w-3" /> Restaurar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setIsConfirmDeleteOpen(true)} className="h-7 text-[10px] bg-rose-600 hover:bg-rose-500 gap-1">
                  <Trash2 className="h-3 w-3" /> Excluir
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <Inbox className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">Nenhum item encontrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">A lixeira está limpa no momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/10 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="p-4 w-12">
                      <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                        {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-sky-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-4 font-semibold">Nome do Item</th>
                    <th className="p-4 font-semibold">Tipo</th>
                    <th className="p-4 font-semibold">Excluído Em</th>
                    <th className="p-4 font-semibold">Excluído Por</th>
                    <th className="p-4 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border/20">
                  {filteredItems.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <tr key={item.id} className={`hover:bg-muted/10 transition-colors ${isSelected ? "bg-sky-500/[0.02]" : ""}`}>
                        <td className="p-4">
                          <button onClick={() => toggleSelect(item.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-sky-500" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 font-medium text-foreground">{item.name}</td>
                        <td className="p-4 text-muted-foreground text-xs">
                          <span className="px-2 py-1 bg-muted/50 rounded-md border border-border/50">{item.type}</span>
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">
                          {new Date(item.deletedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4 text-muted-foreground text-xs">{item.deletedBy}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => handleRestore([item.id])}
                              title="Restaurar"
                              disabled={!isAdmin}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Esvaziar Modal */}
      <Dialog open={isConfirmEmptyOpen} onOpenChange={setIsConfirmEmptyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              Esvaziar Lixeira?
            </DialogTitle>
            <DialogDescription>
              Esta ação removerá <strong>todos os {trashItems.length} itens</strong> da lixeira permanentemente. Não será possível recuperá-los.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmEmptyOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleEmptyTrash} className="bg-rose-600 hover:bg-rose-700">Sim, Esvaziar Tudo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Excluir Lote Modal */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              Excluir Itens Selecionados?
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir <strong>{selectedIds.size} item(ns)</strong> permanentemente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handlePermanentDelete} className="bg-rose-600 hover:bg-rose-700">Confirmar Exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
