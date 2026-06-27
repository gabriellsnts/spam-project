"use client";

import React, { useState, useEffect } from "react";
import { useDomain, CustomTheme, CustomThemeColors } from "@/lib/context/domain-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Paintbrush, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  Eye, 
  Save, 
  CheckCircle
} from "lucide-react";

// Helpers para Cálculo de Acessibilidade WCAG 2.1
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) return null;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(colorHex1: string, colorHex2: string): number {
  const rgb1 = hexToRgb(colorHex1);
  const rgb2 = hexToRgb(colorHex2);
  if (!rgb1 || !rgb2) return 1;
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const DEFAULT_COLORS: CustomThemeColors = {
  primary: "#16a34a", // Emerald Green
  success: "#16a34a", // Emerald Green
  alert: "#ef4444",   // Red/Rose
};

// Presets para o Modo Demo
const PRESETS = [
  {
    name: "Tech Blue Corporate",
    colors: {
      primary: "#2563eb", // Royal Blue
      success: "#059669", // Deep Emerald
      alert: "#dc2626",   // Red
    }
  },
  {
    name: "Warm Orange Energy",
    colors: {
      primary: "#ea580c", // Orange
      success: "#10b981", // Mint Green
      alert: "#e11d48",   // Crimson
    }
  },
  {
    name: "Luxury Indigo",
    colors: {
      primary: "#4f46e5", // Indigo
      success: "#16a34a", // Green
      alert: "#be123c",   // Burgundy
    }
  },
  {
    name: "High Contrast Purple (Acessível)",
    colors: {
      primary: "#7c3aed", // Violet
      success: "#047857", // Dark Green
      alert: "#b91c1c",   // Dark Red
    }
  }
];export function ThemeCustomizer() {
  const {
    activeCustomTheme,
    customThemes,
    applyCustomTheme,
    saveCustomTheme,
    deleteCustomTheme,
    addLog,
    theme: systemMode,
    t,
    language
  } = useDomain();

  // Estados locais para inputs em tempo real (CA01 & CA03)
  const [colors, setColors] = useState<CustomThemeColors>(DEFAULT_COLORS);
  const [themeName, setThemeName] = useState("");

  // Carrega as cores do tema ativo ou padrão
  useEffect(() => {
    if (activeCustomTheme) {
      setColors(activeCustomTheme.colors);
    } else {
      setColors(DEFAULT_COLORS);
    }
  }, [activeCustomTheme]);

  // Atualizador individual de cor
  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    let cleanVal = value;
    if (!value.startsWith("#") && value.length <= 7) {
      cleanVal = "#" + value;
    }
    setColors(prev => ({
      ...prev,
      [key]: cleanVal
    }));
  };

  const previewStyle = {
    "--preview-primary": colors.primary,
    "--preview-success": colors.success,
    "--preview-alert": colors.alert,
  } as React.CSSProperties;

  // Cálculos de acessibilidade WCAG 2.1 (CA04)
  const isDarkBg = systemMode === "dark" || (systemMode === "auto" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const bgColor = isDarkBg ? "#09090b" : "#ffffff";

  // Calcular contrastes
  const primaryTextContrast = getContrastRatio(colors.primary, bgColor);
  const successTextContrast = getContrastRatio(colors.success, bgColor);
  const alertTextContrast = getContrastRatio(colors.alert, bgColor);

  // Combinações reprovadas (< 4.5:1)
  const accessibilityWarnings: string[] = [];

  if (primaryTextContrast < 4.5) {
    accessibilityWarnings.push(
      language === "en"
        ? `Highlight/Primary color has low contrast on text against the ${isDarkBg ? 'dark' : 'light'} background (${primaryTextContrast.toFixed(2)}:1). Minimum required: 4.5:1.`
        : language === "es"
        ? `El color de Destaque/Primario tiene bajo contraste en textos contra el fondo ${isDarkBg ? 'oscuro' : 'claro'} (${primaryTextContrast.toFixed(2)}:1). Mínimo requerido: 4.5:1.`
        : `Destaque/Primária possui baixo contraste em textos contra o fundo ${isDarkBg ? 'escuro' : 'claro'} (${primaryTextContrast.toFixed(2)}:1). Mínimo exigido: 4.5:1.`
    );
  }
  if (successTextContrast < 4.5) {
    accessibilityWarnings.push(
      language === "en"
        ? `Success color has low contrast on text against the ${isDarkBg ? 'dark' : 'light'} background (${successTextContrast.toFixed(2)}:1). Minimum required: 4.5:1.`
        : language === "es"
        ? `El color de Éxito tiene bajo contraste en textos contra el fondo ${isDarkBg ? 'oscuro' : 'claro'} (${successTextContrast.toFixed(2)}:1). Mínimo requerido: 4.5:1.`
        : `Sucesso possui baixo contraste em textos contra o fundo ${isDarkBg ? 'escuro' : 'claro'} (${successTextContrast.toFixed(2)}:1). Mínimo exigido: 4.5:1.`
    );
  }
  if (alertTextContrast < 4.5) {
    accessibilityWarnings.push(
      language === "en"
        ? `Alert color has low contrast on text against the ${isDarkBg ? 'dark' : 'light'} background (${alertTextContrast.toFixed(2)}:1). Minimum required: 4.5:1.`
        : language === "es"
        ? `El color de Alerta tiene bajo contraste en textos contra el fondo ${isDarkBg ? 'oscuro' : 'claro'} (${alertTextContrast.toFixed(2)}:1). Mínimo requerido: 4.5:1.`
        : `Alerta possui baixo contraste em textos contra o fundo ${isDarkBg ? 'escuro' : 'claro'} (${alertTextContrast.toFixed(2)}:1). Mínimo exigido: 4.5:1.`
    );
  }

  // Ações de Confirmação e Salvamento
  const handleApplyTheme = () => {
    const isDefault = colors.primary === DEFAULT_COLORS.primary && 
                      colors.success === DEFAULT_COLORS.success && 
                      colors.alert === DEFAULT_COLORS.alert;

    if (isDefault) {
      applyCustomTheme(null);
      addLog(`[Theme Restored] Tema padrão do sistema restaurado pelo administrador.`);
    } else {
      const activeTheme: CustomTheme = {
        id: activeCustomTheme?.id || `theme-${Math.random().toString(36).substring(2, 9)}`,
        name: activeCustomTheme?.name || "Tema Personalizado Ativo",
        colors
      };
      applyCustomTheme(activeTheme);
      
      const desc = `Destaque: ${colors.primary}, Sucesso: ${colors.success}, Alerta: ${colors.alert}`;
      addLog(`[Theme Update] Tema '${activeTheme.name}' aplicado globalmente. Cores: ${desc}.`);
    }
  };

  const handleSaveAndApply = () => {
    if (!themeName.trim()) {
      alert(
        language === "en"
          ? "Please enter an identifying name to save the theme."
          : language === "es"
          ? "Por favor, introduzca un nombre identificador para guardar el tema."
          : "Por favor, digite um nome identificador para salvar o tema."
      );
      return;
    }

    saveCustomTheme(themeName, colors);
    
    // Auto-aplicar
    const savedTheme: CustomTheme = {
      id: `theme-temp`,
      name: themeName,
      colors
    };
    applyCustomTheme(savedTheme);

    const desc = `Destaque: ${colors.primary}, Sucesso: ${colors.success}, Alerta: ${colors.alert}`;
    addLog(`[Theme Created] Novo tema customizado '${themeName}' salvo e ativado pelo administrador. Cores: ${desc}.`);
    setThemeName("");
  };

  const handleRestoreDefault = () => {
    setColors(DEFAULT_COLORS);
    applyCustomTheme(null);
    addLog(`[Theme Restored] Configurações visuais redefinidas para o tema padrão do sistema.`);
  };

  const handleLoadPreset = (presetName: string, presetColors: CustomThemeColors) => {
    setColors(presetColors);
    const activeTheme: CustomTheme = {
      id: `theme-preset`,
      name: presetName,
      colors: presetColors
    };
    applyCustomTheme(activeTheme);
    
    const desc = `Destaque: ${presetColors.primary}, Sucesso: ${presetColors.success}, Alerta: ${presetColors.alert}`;
    addLog(`[Theme Preset Loaded] Preset do modo demo '${presetName}' ativado. Cores: ${desc}.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel de Configurações de Cor (CA01) */}
        <Card className="lg:col-span-1 border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Paintbrush className="h-4.5 w-4.5 text-emerald-500" />
              {language === "en" ? "Color Selection" : language === "es" ? "Selección de Colores" : "Seleção de Cores"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
              {language === "en" 
                ? "Choose corporate colors using visual pickers or entering hexadecimal codes." 
                : language === "es" 
                ? "Elija los colores corporativos usando los selectores visuales o ingresando códigos hexadecimales." 
                : "Escolha as cores corporativas utilizando os seletores visuais ou inserindo códigos hexadecimais."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-5 flex-1">
            {/* Cor de Destaque / Primária */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-750 dark:text-zinc-300 block">
                {language === "en" ? "Highlight Color (Primary)" : language === "es" ? "Color de Destaque (Primario)" : "Cor de Destaque (Primária)"}
              </label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={colors.primary} 
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="h-10 w-12 rounded-lg bg-background border border-zinc-300 dark:border-zinc-800 cursor-pointer p-1"
                />
                <input 
                  type="text" 
                  value={colors.primary} 
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  placeholder="#16a34a"
                  className="flex-1 text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Cor de Sucesso */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-755 dark:text-zinc-300 block">
                {language === "en" ? "Success Color" : language === "es" ? "Color de Éxito" : "Cor de Sucesso"}
              </label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={colors.success} 
                  onChange={(e) => handleColorChange("success", e.target.value)}
                  className="h-10 w-12 rounded-lg bg-background border border-zinc-300 dark:border-zinc-800 cursor-pointer p-1"
                />
                <input 
                  type="text" 
                  value={colors.success} 
                  onChange={(e) => handleColorChange("success", e.target.value)}
                  placeholder="#16a34a"
                  className="flex-1 text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Cor de Alerta */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-755 dark:text-zinc-300 block">
                {language === "en" ? "Critical Alert Color" : language === "es" ? "Color de Alerta Crítico" : "Cor de Alerta Crítico"}
              </label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={colors.alert} 
                  onChange={(e) => handleColorChange("alert", e.target.value)}
                  className="h-10 w-12 rounded-lg bg-background border border-zinc-300 dark:border-zinc-800 cursor-pointer p-1"
                />
                <input 
                  type="text" 
                  value={colors.alert} 
                  onChange={(e) => handleColorChange("alert", e.target.value)}
                  placeholder="#ef4444"
                  className="flex-1 text-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Ações Rápidas de Aplicação */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/60 flex flex-col gap-2">
              <Button 
                onClick={handleApplyTheme}
                className="w-full text-xs py-2 bg-zinc-900 dark:bg-zinc-955 text-foreground border border-border/80 hover:bg-zinc-850 dark:hover:bg-zinc-900 font-bold"
              >
                {language === "en" ? "Apply to Global Session" : language === "es" ? "Aplicar en la Sesión Global" : "Aplicar na Sessão Global"}
              </Button>
              <Button 
                variant="ghost"
                onClick={handleRestoreDefault}
                className="w-full text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 flex items-center justify-center gap-1 font-bold"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("restore_default")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prévia Interativa em Tempo Real (CA03) */}
        <Card className="lg:col-span-2 border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Eye className="h-4.5 w-4.5 text-emerald-500" />
              {language === "en" ? "Interactive Branding Preview" : language === "es" ? "Vista Previa Interactiva de Marca" : "Prévia Interativa do Branding"}
            </CardTitle>
            <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
              {language === "en" 
                ? "See in real-time how the selected colors affect the key visual elements of the dashboard." 
                : language === "es" 
                ? "Vea en tiempo real cómo los colores seleccionados afectan los elementos visuales clave del panel." 
                : "Veja em tempo real como as cores selecionadas afetam os elementos visuais chaves do painel."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col justify-between space-y-6 pb-6">
            {/* Elementos de Preview Simulado */}
            <div 
              style={previewStyle}
              className="border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-950/60 space-y-4 shadow-inner"
            >
              {/* Mini Header */}
              <div className="flex items-center justify-between p-3.5 bg-background border border-border rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div 
                    style={{ backgroundColor: "var(--preview-primary)" }}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-950 font-black text-xs shadow-md"
                  >
                    SP
                  </div>
                  <span className="font-extrabold text-xs tracking-wider text-foreground">SPAM PREVIEW</span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    style={{ 
                      color: "var(--preview-primary)", 
                      borderColor: "var(--preview-primary)",
                      backgroundColor: `${colors.primary}15`
                    }}
                    className="px-2 py-0.5 rounded-full border text-[9px] font-bold"
                  >
                    {language === "en" ? "Active Training" : language === "es" ? "Entrenamiento Activo" : "Treinamento Ativo"}
                  </span>
                </div>
              </div>

              {/* Grid de Cards de Exemplo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sucesso Card */}
                <div className="border border-border/80 bg-background/50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-semibold">{language === "en" ? "Model Integrity" : language === "es" ? "Integridad del Modelo" : "Integridade do Modelo"}</span>
                    <span 
                      style={{ 
                        color: "var(--preview-success)",
                        backgroundColor: `${colors.success}10`,
                        borderColor: `${colors.success}20`
                      }}
                      className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border"
                    >
                      {language === "en" ? "Stable" : language === "es" ? "Estable" : "Estável"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-foreground">98.4%</span>
                    <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-0.5">
                      {language === "en" ? "✓ Passed" : language === "es" ? "✓ Aprobado" : "✓ Aprovado"}
                    </span>
                  </div>
                  <div 
                    style={{ backgroundColor: `${colors.success}15` }}
                    className="w-full h-1.5 rounded-full overflow-hidden mt-1"
                  >
                    <div 
                      style={{ backgroundColor: "var(--preview-success)", width: "98%" }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>

                {/* Alerta Card */}
                <div className="border border-border/80 bg-background/50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-semibold">{language === "en" ? "Alert Metrics" : language === "es" ? "Métricas de Alerta" : "Métricas de Alerta"}</span>
                    <span 
                      style={{ 
                        color: "var(--preview-alert)",
                        backgroundColor: `${colors.alert}10`,
                        borderColor: `${colors.alert}20`
                      }}
                      className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border"
                    >
                      {language === "en" ? "Critical" : language === "es" ? "Crítico" : "Crítico"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-black text-foreground">87.5%</span>
                    <span 
                      style={{ color: "var(--preview-alert)" }}
                      className="text-[9px] font-bold animate-pulse"
                    >
                      {language === "en" ? "⚠ High Risk" : language === "es" ? "⚠ Riesgo Alto" : "⚠ Risco Alto"}
                    </span>
                  </div>
                  <div 
                    style={{ backgroundColor: `${colors.alert}15` }}
                    className="w-full h-1.5 rounded-full overflow-hidden mt-1"
                  >
                    <div 
                      style={{ backgroundColor: "var(--preview-alert)", width: "87%" }}
                      className="h-full rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-1">
                <button 
                  style={{ 
                    backgroundColor: "var(--preview-primary)",
                    boxShadow: `0 0 10px ${colors.primary}40`
                  }}
                  className="flex-1 py-1.5 rounded-lg text-white font-bold text-[10px] transition-transform active:scale-95 text-center"
                >
                  {language === "en" ? "Highlight Button" : language === "es" ? "Botón de Destaque" : "Botão de Destaque"}
                </button>
                <button 
                  style={{ 
                    color: "var(--preview-primary)",
                    borderColor: `${colors.primary}40`,
                    backgroundColor: `${colors.primary}05`
                  }}
                  className="flex-1 py-1.5 rounded-lg border text-[10px] font-bold text-center"
                >
                  {language === "en" ? "Secondary" : language === "es" ? "Secundario" : "Secundário"}
                </button>
              </div>
            </div>

            {/* Seção de Validação de Acessibilidade (CA04) */}
            <div className="border border-border/60 dark:border-zinc-800/60 rounded-xl p-3.5 bg-muted/20 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                {t("accessibility_check")}
              </h4>
              
              {/* Tabela de Contrasto Ratios */}
              <div className="grid grid-cols-3 gap-2.5 text-[10px]">
                <div className="p-2 rounded-lg bg-background border border-border flex flex-col justify-center min-w-0">
                  <span className="text-muted-foreground font-semibold truncate">{language === "en" ? "Highlight vs Bg" : language === "es" ? "Destaque vs Fondo" : "Destaque vs Fundo"}</span>
                  <span className={`text-xs font-black mt-0.5 ${primaryTextContrast >= 4.5 ? 'text-emerald-500' : 'text-amber-500 font-bold'}`}>
                    {primaryTextContrast.toFixed(2)}:1 ({primaryTextContrast >= 4.5 ? (language === "en" ? "Passed" : language === "es" ? "Aprobado" : "Aprovado") : (language === "en" ? "Attention" : language === "es" ? "Atención" : "Atenção")})
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-background border border-border flex flex-col justify-center min-w-0">
                  <span className="text-muted-foreground font-semibold truncate">{language === "en" ? "Success vs Bg" : language === "es" ? "Éxito vs Fondo" : "Sucesso vs Fundo"}</span>
                  <span className={`text-xs font-black mt-0.5 ${successTextContrast >= 4.5 ? 'text-emerald-500' : 'text-amber-500 font-bold'}`}>
                    {successTextContrast.toFixed(2)}:1 ({successTextContrast >= 4.5 ? (language === "en" ? "Passed" : language === "es" ? "Aprobado" : "Aprovado") : (language === "en" ? "Attention" : language === "es" ? "Atención" : "Atenção")})
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-background border border-border flex flex-col justify-center min-w-0">
                  <span className="text-muted-foreground font-semibold truncate">{language === "en" ? "Alert vs Bg" : language === "es" ? "Alerta vs Fondo" : "Alerta vs Fundo"}</span>
                  <span className={`text-xs font-black mt-0.5 ${alertTextContrast >= 4.5 ? 'text-emerald-500' : 'text-amber-500 font-bold'}`}>
                    {alertTextContrast.toFixed(2)}:1 ({alertTextContrast >= 4.5 ? (language === "en" ? "Passed" : language === "es" ? "Aprobado" : "Aprovado") : (language === "en" ? "Attention" : language === "es" ? "Atención" : "Atenção")})
                  </span>
                </div>
              </div>

              {/* Avisos WCAG */}
              {accessibilityWarnings.length > 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-semibold rounded-lg flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-200">
                  {accessibilityWarnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <p>{warn}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold rounded-lg flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    {language === "en"
                      ? "All colors perfectly meet the contrast ratio requirements of WCAG 2.1 (AA)."
                      : language === "es"
                      ? "Todos los colores cumplen perfectamente con los requisitos de contraste de la norma WCAG 2.1 (AA)."
                      : "Todas as cores atendem perfeitamente aos critérios de contraste exigidos pela WCAG 2.1 (AA)."}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salvar Temas Customizados (CA05) */}
      <Card className="border-zinc-200 dark:border-border/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Save className="h-4.5 w-4.5 text-emerald-500" />
            {language === "en" ? "Saved Themes and Presets" : language === "es" ? "Temas Guardados y Presets" : "Temas Salvos e Presets"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-700 dark:text-zinc-500">
            {language === "en"
              ? "Create new corporate themes or choose a pre-configured preset from Demo Mode for quick testing."
              : language === "es"
              ? "Cree nuevos temas corporativos o elija un preset preconfigurado del Modo Demo para pruebas rápidas."
              : "Crie novos temas corporativos ou escolha um preset pré-configurado do Modo Demo para testes rápidos."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">
          
          {/* Formulário para Salvar Tema */}
          <div className="flex flex-col sm:flex-row items-end gap-3.5 p-4 border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl">
            <div className="flex-1 space-y-2 w-full">
              <label htmlFor="theme-name-input" className="text-xs font-bold text-slate-755 dark:text-zinc-300 block">
                {language === "en" ? "Custom Theme Name" : language === "es" ? "Nombre del Tema Personalizado" : "Nome do Tema Customizado"}
              </label>
              <input
                id="theme-name-input"
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder={language === "en" ? "E.g., Corporate Branding" : language === "es" ? "Ej: Marca Corporativa" : "Ex: Branding Gabriel Alimentos"}
                className="w-full text-xs bg-zinc-100 dark:bg-zinc-955 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <Button
              onClick={handleSaveAndApply}
              className="w-full sm:w-auto h-[38px] text-xs font-bold bg-emerald-600 hover:bg-emerald-555 text-white flex items-center justify-center gap-1.5 rounded-xl px-6 cursor-pointer shrink-0 shadow-lg"
            >
              <Save className="h-3.5 w-3.5" />
              {language === "en" ? "Save and Activate" : language === "es" ? "Guardar y Activar" : "Salvar e Ativar Tema"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Listagem de Temas Salvos pelo Admin */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                {language === "en" ? "Saved Custom Themes" : language === "es" ? "Temas Personalizados Guardados" : "Temas Personalizados Salvos"} ({customThemes.length})
              </h4>
              
              {customThemes.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-border/60 rounded-xl bg-zinc-100/10">
                  {language === "en" ? "No custom themes saved yet." : language === "es" ? "Ningún tema personalizado guardado hasta el momento." : "Nenhum tema personalizado salvo até o momento."}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {customThemes.map((themeItem) => {
                    const isActive = activeCustomTheme?.name === themeItem.name;
                    return (
                      <div 
                        key={themeItem.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          isActive 
                            ? "bg-zinc-100 dark:bg-zinc-950 border-emerald-500/40 shadow-sm" 
                            : "bg-background border-border/80 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate">{themeItem.name}</span>
                          <div className="flex gap-1.5 mt-1.5">
                            <span style={{ backgroundColor: themeItem.colors.primary }} className="h-3.5 w-3.5 rounded-full border border-border/20 shadow-sm" title={language === "en" ? "Highlight" : language === "es" ? "Destaque" : "Destaque"} />
                            <span style={{ backgroundColor: themeItem.colors.success }} className="h-3.5 w-3.5 rounded-full border border-border/20 shadow-sm" title={language === "en" ? "Success" : language === "es" ? "Éxito" : "Sucesso"} />
                            <span style={{ backgroundColor: themeItem.colors.alert }} className="h-3.5 w-3.5 rounded-full border border-border/20 shadow-sm" title={language === "en" ? "Alert" : language === "es" ? "Alerta" : "Alerta"} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => applyCustomTheme(themeItem)}
                            disabled={isActive}
                            className={`h-7 text-[10px] font-bold px-2 rounded-md ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                                : "bg-zinc-900 hover:bg-zinc-800 text-foreground"
                            }`}
                          >
                            {isActive 
                              ? (language === "en" ? "Active" : language === "es" ? "Activo" : "Ativo") 
                              : (language === "en" ? "Activate" : language === "es" ? "Activar" : "Ativar")}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteCustomTheme(themeItem.id)}
                            className="h-7 w-7 text-zinc-500 hover:text-rose-500 hover:bg-rose-550/10"
                            title={language === "en" ? "Delete Theme" : language === "es" ? "Eliminar Tema" : "Excluir Tema"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Presets do Modo Demo (Requisito de Modo Demo Local) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                {language === "en" ? "Corporate Presets (Demo Mode)" : language === "es" ? "Presets Corporativos (Modo Demo)" : "Presets Corporativos (Modo Demo)"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleLoadPreset(preset.name, preset.colors)}
                    className="p-3 bg-background border border-border/80 hover:border-emerald-500/30 hover:bg-muted/30 rounded-xl flex flex-col items-start gap-1.5 transition-all text-left group"
                  >
                    <span className="text-[11px] font-bold text-foreground group-hover:text-emerald-500 transition-colors leading-snug">
                      {preset.name}
                    </span>
                    <div className="flex gap-1.5 mt-1.5">
                      <span style={{ backgroundColor: preset.colors.primary }} className="h-3 w-3 rounded-full border border-border/20 shadow-sm" />
                      <span style={{ backgroundColor: preset.colors.success }} className="h-3 w-3 rounded-full border border-border/20 shadow-sm" />
                      <span style={{ backgroundColor: preset.colors.alert }} className="h-3 w-3 rounded-full border border-border/20 shadow-sm" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
