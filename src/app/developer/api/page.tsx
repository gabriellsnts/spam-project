"use client";

import React, { useState } from "react";
import { Code2, Copy, Check, Key, RefreshCcw, Terminal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DeveloperApiPage() {
  const [apiKey, setApiKey] = useState("sk-test-8f92j3n4b5v6c7x8z9m0");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGenerateNewKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setApiKey(`sk-live-${Math.random().toString(36).substring(2, 15)}`);
      setIsGenerating(false);
    }, 1000);
  };

  const curlSnippet = `curl -X POST https://api.spam.project/v1/predict \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "credit-risk",
    "features": {
      "income": 5000,
      "age": 35,
      "credit_history": 2
    }
  }'`;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-8 w-8 text-orange-500" />
            API & Integrações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas chaves de acesso e integre os modelos preditivos diretamente em seus sistemas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-3 border-border bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="h-5 w-5 text-orange-500" />
              Chave de Acesso (API Key)
            </CardTitle>
            <CardDescription>
              Sua chave secreta para autenticar requisições. Não compartilhe publicamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Input 
                value={apiKey} 
                readOnly 
                className="font-mono bg-muted/30 text-muted-foreground border-border/50 select-all max-w-md"
                type="password"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyKey}
                title="Copiar Chave"
                className="shrink-0"
              >
                {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleGenerateNewKey}
                disabled={isGenerating}
                className="gap-2 shrink-0"
              >
                <RefreshCcw className={"h-4 w-4 " + (isGenerating ? "animate-spin" : "")} />
                {isGenerating ? 'Gerando...' : 'Gerar Nova Chave'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              A chave acima concede acesso total a todos os modelos do seu workspace.
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3 border-border bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5 text-sky-500" />
                Exemplo de Requisição cURL
              </CardTitle>
              <CardDescription>
                Faça uma predição em tempo real utilizando o endpoint REST.
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyCode}
              className="gap-2"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copiedCode ? 'Copiado!' : 'Copiar Código'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-black/80 border border-border/50 p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-emerald-400">
                <code>{curlSnippet}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
