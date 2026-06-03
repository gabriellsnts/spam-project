"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDomain, DOMAINS, DomainType, useDomainColors } from "@/lib/context/domain-context";
import {
  LayoutDashboard,
  Wrench,
  TrendingUp,
  Users,
  ShieldAlert,
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const { activeDomain, initiateDomainSwitch } = useDomain();

  const getDomainIcon = (type: DomainType, className = "h-4 w-4") => {
    switch (type) {
      case "maintenance":
        return <Wrench className={className} />;
      case "demand":
        return <TrendingUp className={className} />;
      case "churn":
        return <Users className={className} />;
      case "credit-risk":
        return <ShieldAlert className={className} />;
    }
  };

  const navItems = [
    {
      id: "maintenance" as DomainType,
      name: DOMAINS["maintenance"].name,
      description: "Falhas & IoT",
      colorClass: "text-red-500 hover:text-red-400 hover:bg-red-500/[0.03]",
      activeBg: "bg-red-500/10 text-red-500 border-red-500",
    },
    {
      id: "demand" as DomainType,
      name: DOMAINS["demand"].name,
      description: "Séries Temporais",
      colorClass: "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/[0.03]",
      activeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500",
    },
    {
      id: "churn" as DomainType,
      name: DOMAINS["churn"].name,
      description: "Retenção CS",
      colorClass: "text-violet-500 hover:text-violet-400 hover:bg-violet-500/[0.03]",
      activeBg: "bg-violet-500/10 text-violet-500 border-violet-500",
    },
    {
      id: "credit-risk" as DomainType,
      name: DOMAINS["credit-risk"].name,
      description: "Score & Default",
      colorClass: "text-blue-500 hover:text-blue-400 hover:bg-blue-500/[0.03]",
      activeBg: "bg-blue-500/10 text-blue-500 border-blue-500",
    },
  ];

  const handleNavigation = (id: DomainType) => {
    initiateDomainSwitch(id);
  };

  return (
    <aside className="w-64 border-r border-border bg-background/50 backdrop-blur-md flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-20 transition-colors duration-300">
      {/* Sidebar Navigation */}
      <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto">
        {/* General Section */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Visão Geral
          </p>
          <button
            onClick={() => router.push("/")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition duration-200 border-l-2 ${
              activeDomain === null
                ? "bg-primary/10 text-primary border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border-transparent"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard Geral</span>
          </button>
        </div>

        {/* Modules Section */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Módulos Analíticos
          </p>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeDomain === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl text-left transition duration-200 border-l-2 ${
                    isActive
                      ? item.activeBg
                      : `text-muted-foreground hover:text-foreground border-transparent hover:bg-muted`
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-semibold">
                    {getDomainIcon(item.id, `h-4 w-4 ${isActive ? "" : item.colorClass.split(" ")[0]}`)}
                    <span>{item.name.split(" ")[0]} {item.name.split(" ")[1] || ""}</span>
                  </div>
                  <span className="text-[10px] pl-6.5 text-muted-foreground/70 font-medium">
                    {item.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="p-4 border-t border-border bg-muted/10">
        <div className="flex items-center justify-between text-[9px] text-muted-foreground/50 font-mono">
          <span>SPAM v1.2.0</span>
          <span>ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
