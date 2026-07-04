import { Suspense } from "react";
import ConteudoVerificarEmail from "./conteudo";

export default function PaginaVerificarEmail() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-bege)] border-t-[var(--color-berry)] rounded-full" />
        </div>
      }
    >
      <ConteudoVerificarEmail />
    </Suspense>
  );
}
