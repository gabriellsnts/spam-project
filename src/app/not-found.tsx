"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDomain } from "@/lib/context/domain-context";

export default function NotFound() {
    const { t } = useDomain();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-2">{t("ui_404_p_gina_n_318")}</h1>
      <p className="text-muted-foreground mb-6">{t("ui_a_p_gina_que_20")}</p>
      <Link href="/" passHref>
        <Button className="bg-green-650 hover:bg-green-600 text-zinc-950 font-bold">
          {t("ui_voltar_para_o_dashboard_688")}</Button>
      </Link>
    </div>
  );
}
