"use client";

import React from "react";
import { Header } from "@/components/shared/header";

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-green-500/20 selection:text-green-400 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-bg text-zinc-500/[0.04] dark:text-zinc-400/[0.02] pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-10 animate-in fade-in duration-500 relative z-10">
        {children}
      </main>
    </div>
  );
}
