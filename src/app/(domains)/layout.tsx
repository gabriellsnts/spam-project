"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import { usePathname } from "next/navigation";
import { useDomain, DOMAINS } from "@/lib/context/domain-context";
import { Loader2 } from "lucide-react";

function DomainSkeleton({ domain }: { domain: string }) {
  const accentColors: Record<string, string> = {
    maintenance: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    demand: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    churn: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    "credit-risk": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };
  const barColors: Record<string, string> = {
    maintenance: "bg-amber-500",
    accent: "bg-amber-500",
    demand: "bg-sky-500",
    churn: "bg-violet-500",
    "credit-risk": "bg-emerald-500",
  };

  const domainName = DOMAINS[domain as any]?.name || "Módulo Analítico";
  const accentClass = accentColors[domain] || "text-green-500 bg-green-500/10 border-green-500/20";
  const barClass = barColors[domain] || "bg-green-500";

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 select-none pointer-events-none">
      {/* Top progress bar simulation */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-muted/30 z-50">
        <div className={`h-full ${barClass} animate-[pulse_1.5s_infinite]`} style={{ width: "70%" }} />
      </div>

      {/* Module Title Banner Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border shadow-md relative overflow-hidden">
        <div className="space-y-2 relative z-10 w-full md:max-w-xl">
          <div className={`flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest ${accentClass} w-fit px-2.5 py-0.5 rounded-full border`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Carregando ecossistema de dados...
          </div>
          <div className="h-7 w-3/4 bg-muted/80 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-muted/60 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted/65 rounded-lg animate-pulse shrink-0 self-end md:self-center" />
      </div>

      {/* Tabs list skeleton */}
      <div className="h-10 w-full max-w-2xl bg-muted/60 border border-border rounded-xl animate-pulse" />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 bg-card border border-border rounded-xl space-y-3">
            <div className="h-3.5 w-1/2 bg-muted/70 rounded animate-pulse" />
            <div className="h-8 w-2/3 bg-muted/90 rounded-lg animate-pulse" />
            <div className="h-3 w-3/4 bg-muted/60 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="h-4.5 w-1/3 bg-muted/80 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-12 w-full bg-muted/60 rounded-lg animate-pulse" />
              <div className="h-12 w-full bg-muted/60 rounded-lg animate-pulse" />
              <div className="h-12 w-full bg-muted/60 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 bg-card border border-border rounded-xl space-y-4">
            <div className="h-4.5 w-1/2 bg-muted/85 rounded animate-pulse" />
            <div className="h-28 w-full bg-muted/65 rounded-lg animate-pulse" />
            <div className="h-20 w-full bg-muted/65 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pageLoading, setPageLoading] = useState(true);
  const [currentDomain, setCurrentDomain] = useState<string>("");

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const domainSegment = segments[segments.length - 1];
    
    const validDomains = ["maintenance", "demand", "churn", "credit-risk"];
    if (domainSegment && validDomains.includes(domainSegment)) {
      setCurrentDomain(domainSegment);
      setPageLoading(true);
      
      const delay = 1500 + Math.random() * 1500; // 1.5s to 3s delay
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setPageLoading(false);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-green-500/20 selection:text-green-400 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-bg text-zinc-500/[0.04] dark:text-zinc-400/[0.02] pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <Header />
      
      <div className="flex flex-1 relative z-10">
        <Sidebar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10 animate-in fade-in duration-500">
          {pageLoading ? (
            <DomainSkeleton domain={currentDomain} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
