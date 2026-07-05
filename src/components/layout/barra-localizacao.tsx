"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";

export function useCidadeUsuario() {
  const { usuario, accessToken } = useAutenticacao();
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");

  useEffect(() => {
    if (!usuario || !accessToken) return;
    fetch("/api/usuarios/endereco", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso && d.dados?.cidade) {
          setCidade(d.dados.cidade);
          setCep(d.dados.cep || "");
        }
      })
      .catch(() => {});
  }, [usuario, accessToken]);

  return { cidade, cep };
}

export function SeloLocalizacao() {
  const { cidade, cep } = useCidadeUsuario();

  if (!cidade) return null;

  const cepFormatado = cep.replace(/\D/g, "").slice(0, 8);
  const cepExibicao =
    cepFormatado.length === 8
      ? `${cepFormatado.slice(0, 5)}-${cepFormatado.slice(5)}`
      : cep;

  return (
    <div className="hidden min-w-0 items-center gap-1.5 rounded-full border border-[#eadfd5] bg-white px-3 py-1.5 text-xs sm:flex">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-berry)]" />
      <span className="truncate font-medium text-[#2a211d]">
        {cidade}
        {cepExibicao ? ` · ${cepExibicao}` : ""}
      </span>
    </div>
  );
}
