"use client";

import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";

interface DadosLocalizacao {
  cidade: string;
  cep: string;
  logradouro: string;
  bairro: string;
  estado: string;
  origem: "gps" | "cadastro";
}

export function useCidadeUsuario() {
  const { usuario, accessToken } = useAutenticacao();
  const [dados, setDados] = useState<DadosLocalizacao | null>(null);

  const buscarDoCadastro = useCallback(async () => {
    if (!usuario || !accessToken) return null;
    try {
      const r = await fetch("/api/usuarios/endereco", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const d = await r.json();
      if (d.sucesso && d.dados?.cidade) {
        return { ...d.dados, origem: "cadastro" as const };
      }
    } catch {}
    return null;
  }, [usuario, accessToken]);

  const buscarPorGps = useCallback(async (): Promise<DadosLocalizacao | null> => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          enableHighAccuracy: false,
        });
      });
      const { latitude, longitude } = pos.coords;
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=pt-BR`
      );
      const d = await r.json();
      const addr = d.address || {};
      return {
        cidade: addr.city || addr.town || addr.municipality || addr.suburb || "",
        cep: addr.postcode || "",
        logradouro: addr.road || "",
        bairro: addr.suburb || addr.neighbourhood || "",
        estado: addr.state || "",
        origem: "gps",
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    async function init() {
      const gps = await buscarPorGps();
      if (gps?.cidade) {
        setDados(gps);
        // Salva no perfil automaticamente
        if (accessToken) {
          fetch("/api/usuarios/endereco", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              cep: gps.cep.replace(/\D/g, "").slice(0, 8) || "00000000",
              logradouro: gps.logradouro || "Endereço",
              numero: "S/N",
              bairro: gps.bairro || "",
              cidade: gps.cidade,
              estado: gps.estado || "",
            }),
          }).catch(() => {});
        }
        return;
      }
      const cadastro = await buscarDoCadastro();
      if (cadastro) setDados(cadastro);
    }
    init();
  }, [buscarDoCadastro, buscarPorGps, accessToken]);

  // Escuta evento para atualizar em tempo real
  useEffect(() => {
    const handler = () => { buscarDoCadastro().then(d => d && setDados(d)); };
    window.addEventListener("endereco-atualizado", handler);
    return () => window.removeEventListener("endereco-atualizado", handler);
  }, [buscarDoCadastro]);

  return { dados, atualizar: () => buscarDoCadastro().then(d => d && setDados(d)) };
}

export function SeloLocalizacao() {
  const { usuario } = useAutenticacao();
  const { dados } = useCidadeUsuario();

  const cepFormatado = dados?.cep?.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2") || "";

  if (!dados?.cidade) {
    if (!usuario) return null;
    return (
      <Link
        href="/perfil"
        className="hidden items-center gap-1.5 rounded-full border border-[#eadfd5] bg-white px-3 py-1.5 text-xs font-medium text-[#715f55] hover:text-[var(--color-berry)] transition-colors sm:flex"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        Adicionar endereço
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className="hidden items-center gap-1.5 rounded-full border border-[#eadfd5] bg-white px-3 py-1.5 text-xs transition-colors hover:border-[var(--color-berry)] sm:flex"
    >
      {dados.origem === "gps" ? (
        <Navigation className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" />
      ) : (
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-berry)]" />
      )}
      <span className="truncate font-medium text-[#2a211d]">
        {[dados.cidade, cepFormatado ? `CEP ${cepFormatado}` : null].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}
