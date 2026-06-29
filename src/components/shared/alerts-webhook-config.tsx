"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, Webhook, Plus, Trash2, Save, Mail } from "lucide-react";
import { useDomain } from "@/lib/context/domain-context";

export function AlertsWebhookConfig() {
  const { activeDomain, showPremiumToast } = useDomain();
  
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emails, setEmails] = useState("admin@spam.com, data.science@spam.com");
  
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: "https://api.empresa.com/v1/ml-events", event: "model_drift", active: true },
    { id: 2, url: "https://hooks.slack.com/services/T00/B00/XXX", event: "retrain_success", active: false },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const addWebhook = () => {
    const newId = webhooks.length > 0 ? Math.max(...webhooks.map(w => w.id)) + 1 : 1;
    setWebhooks([...webhooks, { id: newId, url: "", event: "model_drift", active: true }]);
  };

  const updateWebhook = (id: number, field: string, value: string | boolean) => {
    setWebhooks(webhooks.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const removeWebhook = (id: number) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showPremiumToast(`Configurações de Alertas salvas para ${activeDomain || "todos"}`, "success");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Alertas por E-mail (RF78) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            Notificações por E-mail (RF78)
          </CardTitle>
          <CardDescription>
            Configure alertas sobre degradação de modelo, novos retreinamentos e incidentes de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg">
            <div className="flex flex-col space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Alertas Ativos
              </Label>
              <span className="text-sm text-muted-foreground">
                Receber notificações críticas sobre o pipeline de {activeDomain || "todos"}.
              </span>
            </div>
            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
          </div>

          <div className={`space-y-2 transition-opacity ${emailAlerts ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <Label>E-mails de Destino (separados por vírgula)</Label>
            <Input 
              placeholder="ex: equipe@empresa.com" 
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Estes e-mails receberão resumos semanais (Gains/Lift) e alertas imediatos em caso de PSI &gt; 0.1.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks (RF51) */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Webhook className="h-5 w-5 text-emerald-500" />
                Integração via Webhooks (RF51)
              </CardTitle>
              <CardDescription>
                Dispare requisições HTTP automáticas quando eventos do ciclo de vida do modelo ocorrerem.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addWebhook} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
              Nenhum webhook configurado.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Evento-Gatilho</TableHead>
                    <TableHead>Endpoint (URL)</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((hook) => (
                    <TableRow key={hook.id}>
                      <TableCell>
                        <Switch 
                          checked={hook.active} 
                          onCheckedChange={(checked) => updateWebhook(hook.id, "active", checked)} 
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={hook.event} 
                          onValueChange={(val) => updateWebhook(hook.id, "event", val)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="model_drift">Data Drift Detectado</SelectItem>
                            <SelectItem value="retrain_success">Retreinamento Concluído</SelectItem>
                            <SelectItem value="retrain_failed">Falha no Retreinamento</SelectItem>
                            <SelectItem value="anomaly_detected">Anomalia de Previsão</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="https://..." 
                          value={hook.url}
                          onChange={(e) => updateWebhook(hook.id, "url", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => removeWebhook(hook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Salvando..." : "Salvar Integrações"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
