"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";

export function useCidadeUsuario() {
  const { usuario, accessToken } = useAutenticacao();
  const [cidade, setCidade] = useState("");
  const [cep, setCep] = useState("");

  const buscarEndereco = useCallback(async () => {
    if (!usuario || !accessToken) return;
    try {
      const resposta = await fetch("/api/usuarios/endereco", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const dados = await resposta.json();
      if (dados.sucesso && dados.dados) {
        setCidade(dados.dados.cidade || "");
        setCep(dados.dados.cep || "");
      }
    } catch {}
  }, [usuario, accessToken]);

  useEffect(() => {
    buscarEndereco();
  }, [buscarEndereco]);

  // Escuta evento customizado para atualizar em tempo real
  // quando o usuário salva o endereço na página de perfil
  useEffect(() => {
    function aoAtualizarEndereco() {
      buscarEndereco();
    }
    window.addEventListener("endereco-atualizado", aoAtualizarEndereco);
    return () => window.removeEventListener("endereco-atualizado", aoAtualizarEndereco);
  }, [buscarEndereco]);

  return { cidade, cep };
}

export function SeloLocalizacao() {
  const { usuario } = useAutenticacao();
  const { cidade, cep } = useCidadeUsuario();

  const cepFormatado = cep.replace(/\D/g, "").slice(0, 8);
  const cepExibicao =
    cepFormatado.length === 8
      ? `${cepFormatado.slice(0, 5)}-${cepFormatado.slice(5)}`
      : cep;

  // Sempre mostra o selo, mesmo sem endereço — incentiva o cadastro
  const temEndereco = !!(cidade || cepExibicao);

  return (
    <div className="hidden min-w-0 items-center rounded-full border border-[#eadfd5] bg-white px-3 py-1.5 text-xs sm:flex">
      {temEndereco ? (
        <span className="flex items-center gap-1.5 truncate font-medium text-[#2a211d]">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-berry)]" />
          {[cidade, cepExibicao ? `CEP ${cepExibicao}` : null].filter(Boolean).join(" · ")}
        </span>
      ) : usuario ? (
        <Link href="/perfil" className="flex items-center gap-1.5 truncate font-medium text-[#715f55] hover:text-[var(--color-berry)] transition-colors">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Adicionar endereço
        </Link>
      ) : null}
    </div>
  );
}
