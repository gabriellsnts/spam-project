"use client";

import React, { useState, useEffect } from "react";
import { Code2, Copy, Check, Key, RefreshCcw, Terminal, Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDomain } from "@/lib/context/domain-context";

export default function DeveloperApiPage() {
  const { addLog } = useDomain();
  
  // CA01 & CA03: Key state and rotation
  const [apiKey, setApiKey] = useState("sk-test-8f92j3n4b5v6c7x8z9m0");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKey, setShowKey] = useState(false); // CA02: Show/Hide Key

  // Check localStorage for persisted key on mount
  useEffect(() => {
    const saved = localStorage.getItem("spam-api-key");
    if (saved) setApiKey(saved);
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCode = (snippet: string) => { // CA05
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGenerateNewKey = () => { // CA03
    setIsGenerating(true);
    setTimeout(() => {
      const newKey = `sk-live-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newKey);
      localStorage.setItem("spam-api-key", newKey);
      addLog("[API] Chave de API rotacionada pelo usuário.");
      setIsGenerating(false);
    }, 1000);
  };

  // CA04: Snippets
  const snippets = {
    curl: `curl -X POST https://api.spam.project/v1/predict \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "credit-risk",
    "features": {
      "income": 5000,
      "age": 35,
      "credit_history": 2
    }
  }'`,
    python: `import requests

url = "https://api.spam.project/v1/predict"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
data = {
    "domain": "credit-risk",
    "features": {
        "income": 5000,
        "age": 35,
        "credit_history": 2
    }
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
    node: `const axios = require('axios');

const url = 'https://api.spam.project/v1/predict';
const data = {
  domain: 'credit-risk',
  features: {
    income: 5000,
    age: 35,
    credit_history: 2
  }
};

axios.post(url, data, {
  headers: {
    'Authorization': \`Bearer ${apiKey}\`,
    'Content-Type': 'application/json'
  }
}).then(response => {
  console.log(response.data);
}).catch(console.error);`
  };

  // Display value for CA01
  const displayKey = showKey ? apiKey : `sk-••••••••••••••••••••••••`;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-8 w-8 text-orange-500" />
            API & Integrações
          </h1>
          <p className="text-muted-foreground mt-1">
            Integre os modelos preditivos diretamente em seus sistemas através da nossa REST API.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* API Key Management */}
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
            <div className="flex items-center gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Input 
                  value={displayKey} 
                  readOnly 
                  className="font-mono bg-muted/30 text-muted-foreground border-border/50 pr-10"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  title={showKey ? "Ocultar Chave" : "Exibir Chave"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button 
                variant="outline" 
                onClick={handleCopyKey}
                title="Copiar Chave"
                className="shrink-0 gap-2 w-28"
              >
                {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copiedKey ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleGenerateNewKey}
                disabled={isGenerating}
                className="gap-2 shrink-0 bg-orange-600/10 text-orange-500 hover:bg-orange-600/20 hover:text-orange-600 border border-orange-500/20"
              >
                <RefreshCcw className={"h-4 w-4 " + (isGenerating ? "animate-spin" : "")} />
                {isGenerating ? 'Gerando...' : 'Rotacionar Chave'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documentation / Rate Limits (CA06) */}
        <Card className="col-span-1 md:col-span-1 border-border bg-card/50 backdrop-blur h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-sky-500" />
              Documentação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-md">
              <strong className="text-sky-500 block mb-1">Base URL</strong>
              <code className="text-foreground">https://api.spam.project/v1</code>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Rate Limits (Mockados)</h4>
              <ul className="list-disc pl-4 space-y-1">
                <li>100 requisições por minuto.</li>
                <li>Picos de até 300 requisições (Burst).</li>
                <li>Ultrapassar o limite retornará erro <code>429 Too Many Requests</code>.</li>
              </ul>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-border/30">
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Formato de Resposta
              </h4>
              <p>Todas as respostas bem sucedidas retornarão <code>200 OK</code> com payload em JSON:</p>
              <pre className="p-2 bg-black/50 rounded border border-border/50 text-[10px] text-emerald-400 font-mono mt-2 overflow-x-auto">
{`{
  "success": true,
  "prediction": {
    "score": 0.85,
    "classification": "Alto Risco"
  },
  "timestamp": "2026-06-27T19:00:00Z"
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Integration Examples (CA04 & CA05) */}
        <Card className="col-span-1 md:col-span-2 border-border bg-card/50 backdrop-blur">
          <CardHeader className="pb-2 border-b border-border/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Terminal className="h-5 w-5 text-emerald-500" />
              Exemplos de Integração
            </CardTitle>
            <CardDescription>
              Faça predições enviando um POST para o endpoint <code>/predict</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="curl" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-muted/50 border border-border/50">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                </TabsList>
              </div>

              {Object.entries(snippets).map(([lang, code]) => (
                <TabsContent key={lang} value={lang} className="relative mt-0 animate-in fade-in zoom-in-95">
                  <div className="absolute right-2 top-2 z-10">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleCopyCode(code)}
                      className="h-7 text-[10px] gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedCode ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                  <div className="rounded-md bg-[#0d1117] border border-border/50 p-4 pt-10 overflow-x-auto">
                    <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed">
                      <code>{code}</code>
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
