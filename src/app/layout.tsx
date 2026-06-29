import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DomainProvider } from "@/lib/context/domain-context";
import { LoadingOverlay } from "@/components/shared/loading-overlay";
import { ConfirmSwitchDialog } from "@/components/shared/confirm-switch-dialog";
import { AuthGuard } from "@/components/shared/auth-guard";
import { EmailNotificationsRenderer } from "@/components/shared/email-notifications-renderer";
import { InteractiveTutorial } from "@/components/shared/interactive-tutorial";

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
          <AuthGuard>
            {children}
          </AuthGuard>
          <LoadingOverlay />
          <ConfirmSwitchDialog />
          <EmailNotificationsRenderer />
          <InteractiveTutorial />
        </DomainProvider>
      </body>
    </html>
  );
}
