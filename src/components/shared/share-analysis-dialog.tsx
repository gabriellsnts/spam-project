"use client";

import React, { useState } from "react";
import { Share2, Link as LinkIcon, Check, Copy, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ShareAnalysisDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSending(true);
    // Simulate API call to send email invitation
    setTimeout(() => {
      setIsSending(false);
      setEmail("");
      setIsOpen(false);
      // Here we would ideally show a global toast notification
      alert(\`Análise compartilhada com \${email} com sucesso!\`);
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Compartilhar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-sky-500" />
            Compartilhar Análise
          </DialogTitle>
          <DialogDescription>
            Qualquer pessoa do seu workspace com o link poderá visualizar o estado atual deste painel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Copiar Link Direto</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  defaultValue={typeof window !== "undefined" ? window.location.href : "https://app.spam.project/..."}
                  readOnly
                  className="pl-9 font-mono text-xs bg-muted/30 text-muted-foreground"
                />
              </div>
              <Button type="button" size="sm" onClick={handleCopyLink} className="shrink-0 gap-2 w-24">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold">
                Ou envie por e-mail
              </span>
            </div>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-2">
            <label className="text-sm font-medium text-foreground">Endereço de E-mail do Colega</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
              <Button type="submit" size="sm" disabled={!email || isSending} className="shrink-0 gap-2 bg-sky-600 hover:bg-sky-500 text-white">
                <Send className={\`h-4 w-4 \${isSending ? 'animate-bounce' : ''}\`} />
                {isSending ? "Enviando..." : "Enviar Convite"}
              </Button>
            </div>
          </form>
        </div>
        <DialogFooter className="sm:justify-start">
          <p className="text-[10px] text-muted-foreground text-center w-full">
            Esta análise permanecerá salva e acessível através deste link por 30 dias.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
