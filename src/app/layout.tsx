import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DomainProvider } from "@/lib/context/domain-context";
import { LoadingOverlay } from "@/components/shared/loading-overlay";
import { ConfirmSwitchDialog } from "@/components/shared/confirm-switch-dialog";
import { Navbar } from "@/components/shared/navbar";
import { Sidebar } from "@/components/shared/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SPAM System",
  description: "Sistema Preditivo de Análise Multi-Domínio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <DomainProvider>
          <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 grid-bg text-zinc-500/[0.04] dark:text-zinc-400/[0.02] pointer-events-none z-0" />
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Navbar */}
            <Navbar />

            {/* Main Flex Area */}
            <div className="flex flex-1 relative z-10 overflow-hidden">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content Viewport */}
              <main className="flex-1 overflow-y-auto px-4 py-8 md:px-6 md:py-10 max-w-7xl mx-auto w-full relative">
                {children}
              </main>
            </div>
          </div>
          <LoadingOverlay />
          <ConfirmSwitchDialog />
        </DomainProvider>
      </body>
    </html>
  );
}
