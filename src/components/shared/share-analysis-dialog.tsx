"use client";

import React, { useState, useEffect } from "react";
import { Share2, Link as LinkIcon, Check, Copy, Mail, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams, usePathname } from "next/navigation";
import { useDomain } from "@/lib/context/domain-context";
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
  const { t } = useDomain();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // CA02: Capture current URL state including filters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const queryStr = searchParams.toString();
      const fullUrl = `${origin}${pathname}${queryStr ? `?${queryStr}` : ""}`;
      setGeneratedLink(fullUrl);
    }
  }, [searchParams, pathname, isOpen]);

  const handleCopyLink = () => { // CA03
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = (e: React.FormEvent) => { // CA04 & CA05
    e.preventDefault();
    if (!email) return;
    
    setIsSending(true);
    // Simulate API call to send email invitation
    setTimeout(() => {
      setIsSending(false);
      setEmail("");
      setToastMsg(`Convite enviado com sucesso para ${email}!`);
      setTimeout(() => {
        setToastMsg("");
        setIsOpen(false);
      }, 2500);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* CA01: Button to open Modal */}
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4 text-sky-500" />
          <span className="hidden sm:inline">{t("ui_compartilhar_252")}</span>
        </Button>
      </DialogTrigger>
      
      {/* CA02: Modal UI */}
      <DialogContent className="sm:max-w-md relative overflow-hidden">
        
        {/* Feedback Toast Overlay */}
        {toastMsg && (
          <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in-95">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center gap-3 text-emerald-500 shadow-xl">
              <Check className="h-5 w-5" />
              <span className="font-semibold">{toastMsg}</span>
            </div>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-sky-500" />
            {t("ui_compartilhar_an_lise_547")}</DialogTitle>
          <DialogDescription>
            {t("ui_qualquer_pessoa_com_este_166")}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("ui_copiar_link_direto_293")}</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  value={generatedLink}
                  readOnly
                  className="pl-9 font-mono text-xs bg-muted/30 text-muted-foreground border-border/50 truncate"
                />
              </div>
              <Button type="button" size="sm" onClick={handleCopyLink} className="shrink-0 gap-2 w-28">
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-semibold tracking-wider">
                {t("ui_ou_envie_convite_973")}</span>
            </div>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("ui_endere_o_de_e_903")}</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t("ui_nome_exemplo_com_br_822")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 border-border/50"
                  required
                />
              </div>
              <Button type="submit" size="sm" disabled={!email || isSending} className="shrink-0 gap-2 bg-sky-600 hover:bg-sky-500 text-white w-32">
                <Send className={"h-4 w-4 " + (isSending ? "animate-bounce" : "")} />
                {isSending ? "Enviando..." : "Enviar Link"}
              </Button>
            </div>
          </form>
        </div>
        
        <DialogFooter className="sm:justify-start border-t border-border/30 pt-4 mt-2">
          {/* CA06: Expiration warning */}
          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 w-full bg-muted/20 p-2 rounded">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            {t("ui_links_de_compartilhamento_direto_50")}</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
