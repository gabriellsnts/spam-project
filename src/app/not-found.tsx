"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-2">404 - Página Não Encontrada</h1>
      <p className="text-muted-foreground mb-6">A página que você está procurando não existe ou foi movida.</p>
      <Link href="/" passHref>
        <Button className="bg-green-650 hover:bg-green-600 text-zinc-950 font-bold">
          Voltar para o Dashboard
        </Button>
      </Link>
    </div>
  );
}
