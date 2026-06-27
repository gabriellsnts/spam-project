"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDomain } from "@/lib/context/domain-context";
import { Info } from "lucide-react";

interface GlossaryTooltipProps {
  termId: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({ termId, children }: GlossaryTooltipProps) {
  const { getGlossaryTerm } = useDomain();
  const [isVisible, setIsVisible] = useState(false);
  const termData = getGlossaryTerm(termId);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Close tooltip when pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVisible(false);
      }
    };
    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVisible]);

  if (!termData) {
    return <>{children}</>;
  }

  return (
    <span 
      className="relative inline-flex items-center gap-1 cursor-help group"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <span className="border-b border-dashed border-sky-400 text-foreground group-hover:text-sky-500 transition-colors">
        {children}
      </span>
      <Info className="h-3 w-3 text-muted-foreground group-hover:text-sky-500 opacity-50 group-hover:opacity-100 transition-opacity" />

      {isVisible && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 shadow-xl rounded-lg text-sm text-left animate-in fade-in zoom-in-95 duration-200"
          role="tooltip"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-zinc-100">{termData.term}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-sky-500/20 text-sky-400">
              {termData.category}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-normal">
            {termData.definition}
          </p>
          {/* Seta do balão */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-zinc-900"></div>
          {/* Borda da seta (para simular o border da box) */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-transparent border-t-zinc-700 -z-10"></div>
        </div>
      )}
    </span>
  );
}
