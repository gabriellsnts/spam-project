"use client";

import React, { useState } from "react";
import { BookA, Search, BookOpen, Plus, Edit, Trash2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDomain, GlossaryTerm, GlossaryCategory } from "@/lib/context/domain-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function GlossaryPage() {
  const { glossary, addGlossaryTerm, updateGlossaryTerm, deleteGlossaryTerm, currentUser } = useDomain();
  
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<GlossaryCategory | "Todas">("Todas");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTermId, setCurrentTermId] = useState<string | null>(null);
  
  // Form state
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [category, setCategory] = useState<GlossaryCategory>("Geral");
  
  const categories: (GlossaryCategory | "Todas")[] = ["Todas", "Geral", "Machine Learning", "Métricas", "Logística", "Previsão"];

  const isAdmin = currentUser?.accessProfile === "Super Admin" || currentUser?.accessProfile === "Gestor Analítico";

  const handleOpenModal = (termToEdit?: GlossaryTerm) => {
    if (termToEdit) {
      setIsEditing(true);
      setCurrentTermId(termToEdit.id);
      setTerm(termToEdit.term);
      setDefinition(termToEdit.definition);
      setCategory(termToEdit.category);
    } else {
      setIsEditing(false);
      setCurrentTermId(null);
      setTerm("");
      setDefinition("");
      setCategory("Geral");
    }
    setIsModalOpen(true);
  };

  const handleSaveTerm = () => {
    if (!term || !definition) return;
    
    if (isEditing && currentTermId) {
      updateGlossaryTerm(currentTermId, { term, definition, category, relatedTerms: glossary.find(t => t.id === currentTermId)?.relatedTerms });
    } else {
      addGlossaryTerm({ term, definition, category, relatedTerms: [] });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este termo do glossário? Esta ação é irreversível e será registrada nos logs.")) {
      deleteGlossaryTerm(id);
    }
  };

  const filteredTerms = glossary.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                          item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const scrollToTerm = (id: string) => {
    const element = document.getElementById(`term-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-sky-500/10', 'border-sky-500/50');
      setTimeout(() => {
        element.classList.remove('bg-sky-500/10', 'border-sky-500/50');
      }, 2000);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookA className="h-8 w-8 text-sky-500" />
            Glossário Técnico
          </h1>
          <p className="text-muted-foreground mt-1">
            Consulte o significado de métricas, termos de negócio e conceitos técnicos do sistema.
          </p>
        </div>
        
        {isAdmin && (
          <Button onClick={() => handleOpenModal()} className="gap-2 bg-sky-600 hover:bg-sky-500 text-white">
            <Plus className="h-4 w-4" />
            Novo Termo
          </Button>
        )}
      </div>

      <Card className="border-border bg-card/50 backdrop-blur">
        <CardHeader className="pb-4 border-b border-border/50 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input 
                placeholder="Buscar por termo ou palavras na definição..." 
                className="pl-9 bg-background/50 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat 
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center">
              <BookOpen className="h-12 w-12 mb-3 opacity-20" />
              <p>Nenhum termo encontrado para sua busca e filtros.</p>
              <Button variant="link" onClick={() => { setSearch(""); setCategoryFilter("Todas"); }} className="mt-2">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTerms.map((item) => (
                <div 
                  id={`term-${item.id}`}
                  key={item.id} 
                  className="group p-5 rounded-xl border border-border/50 bg-background/30 hover:bg-muted/10 transition-all duration-300 relative flex flex-col h-full"
                >
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10" onClick={() => handleOpenModal(item)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3 pr-16">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-sky-400 transition-colors">
                      {item.term}
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-[10px] font-bold px-2 py-1 bg-muted rounded-md text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {item.definition}
                  </p>

                  {/* CA06: Termos Relacionados */}
                  {item.relatedTerms && item.relatedTerms.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-border/30">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> Termos Relacionados
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.relatedTerms.map(relatedId => {
                          const relatedTerm = glossary.find(t => t.id === relatedId);
                          if (!relatedTerm) return null;
                          return (
                            <button
                              key={relatedId}
                              onClick={() => scrollToTerm(relatedId)}
                              className="text-xs text-sky-500 hover:text-sky-400 hover:underline transition-all"
                            >
                              {relatedTerm.term}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Termo" : "Novo Termo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Termo</label>
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Ex: Lead Time" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Categoria</label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={category}
                onChange={(e) => setCategory(e.target.value as GlossaryCategory)}
              >
                {categories.filter(c => c !== "Todas").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Definição</label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                value={definition} 
                onChange={(e) => setDefinition(e.target.value)} 
                placeholder="Explicação clara do termo..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveTerm} disabled={!term || !definition} className="bg-sky-600 hover:bg-sky-500 text-white">
              Salvar Termo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
