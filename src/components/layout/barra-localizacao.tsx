"use client";

import { MapPin, Navigation, X } from "lucide-react";
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

  // Busca endereço do cadastro ao montar (sem GPS automático)
  useEffect(() => {
    buscarDoCadastro().then(d => d && setDados(d));
  }, [buscarDoCadastro]);

  useEffect(() => {
    const handler = () => { buscarDoCadastro().then(d => d && setDados(d)); };
    window.addEventListener("endereco-atualizado", handler);
    return () => window.removeEventListener("endereco-atualizado", handler);
  }, [buscarDoCadastro]);

  return { dados, setDados, buscarDoCadastro };
}

export function SeloLocalizacao() {
  const { usuario } = useAutenticacao();
  const { dados, setDados } = useCidadeUsuario();
  const [mostrarPedido, setMostrarPedido] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Após 5s, mostra o banner pedindo GPS se não tiver localização ainda
  useEffect(() => {
    if (dados?.origem === "gps" || !usuario) return;
    const timer = setTimeout(() => setMostrarPedido(true), 5000);
    return () => clearTimeout(timer);
  }, [dados?.origem, usuario]);

  async function solicitarGps() {
    setBuscando(true);
    setMostrarPedido(false);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000, enableHighAccuracy: false,
        });
      });
      const { latitude, longitude } = pos.coords;
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=pt-BR`
      );
      const d = await r.json();
      const addr = d.address || {};
      const gps = {
        cidade: addr.city || addr.town || addr.municipality || addr.suburb || "",
        cep: addr.postcode || "",
        logradouro: addr.road || "",
        bairro: addr.suburb || addr.neighbourhood || "",
        estado: addr.state || "",
        origem: "gps" as const,
      };
      setDados(gps);
      // Salva no perfil
      const token = (window as any).__accessToken;
      if (token && gps.cidade) {
        fetch("/api/usuarios/endereco", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    } catch {
      // Usuário recusou ou erro — mantém o que já tem
    }
    setBuscando(false);
  }

  const cepFormatado = dados?.cep?.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2") || "";

  // Banner flutuante pedindo permissão GPS (aparece após 5s)
  if (mostrarPedido) {
    return (
      <>
        <div className="fixed bottom-20 left-4 right-4 z-[80] mx-auto max-w-sm rounded-xl border border-[#eadfd5] bg-white p-4 shadow-xl sm:left-auto sm:right-5 sm:w-80 animate-[entrada-suave_300ms_ease]">
          <div className="flex items-start gap-3">
            <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-sage)]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#2a211d]">Sua localização</p>
              <p className="text-xs text-[#715f55] mt-1">
                Podemos usar seu GPS para mostrar ofertas próximas e preencher o endereço automaticamente?
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={solicitarGps} className="text-xs font-semibold bg-[#b98a2d] text-white px-3 py-1.5 rounded-lg hover:bg-[#a07822] transition-colors cursor-pointer">
                  {buscando ? "Buscando..." : "Permitir"}
                </button>
                <button onClick={() => setMostrarPedido(false)} className="text-xs font-medium text-[#715f55] px-3 py-1.5 rounded-lg hover:bg-[#f6f2ec] transition-colors cursor-pointer">
                  Agora não
                </button>
              </div>
            </div>
            <button onClick={() => setMostrarPedido(false)} className="p-1 text-[#715f55]/50 hover:text-[#715f55] cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Selo normal com dados do cadastro */}
        <SeloConteudo dados={dados} usuario={usuario} cepFormatado={cepFormatado} />
      </>
    );
  }

  return <SeloConteudo dados={dados} usuario={usuario} cepFormatado={cepFormatado} />;
}

function SeloConteudo({
  dados, usuario, cepFormatado,
}: {
  dados: DadosLocalizacao | null;
  usuario: { nomeCompleto: string } | null;
  cepFormatado: string;
}) {
  if (!dados?.cidade) {
    if (!usuario) return null;
    return (
      <Link
        href="/perfil"
        className="hidden items-center gap-1.5 rounded-full border border-[#eadfd5] bg-white px-3 py-1.5 text-xs font-medium text-[#715f55] hover:text-[#b98a2d] transition-colors sm:flex"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        Adicionar endereço
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className="hidden items-center gap-1.5 rounded-full border border-[#eadfd5] bg-white px-3 py-1.5 text-xs transition-colors hover:border-[#b98a2d] sm:flex"
    >
      {dados.origem === "gps" ? (
        <Navigation className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" />
      ) : (
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b98a2d]" />
      )}
      <span className="truncate font-medium text-[#2a211d]">
        {[dados.cidade, cepFormatado ? `CEP ${cepFormatado}` : null].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}
