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
    try {
      const cache = sessionStorage.getItem("mca_endereco_cache");
      if (cache) setDados(JSON.parse(cache));
    } catch {}
    buscarDoCadastro().then(d => { if (d) { setDados(d); try { sessionStorage.setItem("mca_endereco_cache", JSON.stringify(d)); } catch {} } });
  }, [buscarDoCadastro]);

  useEffect(() => {
    const handler = () => { buscarDoCadastro().then(d => { if (d) { setDados(d); try { sessionStorage.setItem("mca_endereco_cache", JSON.stringify(d)); } catch {} } }); };
    window.addEventListener("endereco-atualizado", handler);
    return () => window.removeEventListener("endereco-atualizado", handler);
  }, [buscarDoCadastro]);

  return { dados, setDados, buscarDoCadastro };
}

export function SeloLocalizacao() {
  const { usuario, accessToken } = useAutenticacao();
  const { dados, setDados } = useCidadeUsuario();
  const [mostrarPedido, setMostrarPedido] = useState(false);
  const [buscando, setBuscando] = useState(false);

  // Só mostra o pedido de GPS uma vez por sessão (salva no sessionStorage)
  useEffect(() => {
    if (dados?.origem === "gps" || !usuario) return;
    const jaPerguntou = sessionStorage.getItem("gps_perguntado");
    if (jaPerguntou) return;
    const timer = setTimeout(() => setMostrarPedido(true), 5000);
    return () => clearTimeout(timer);
  }, [dados?.origem, usuario]);

  async function solicitarGps() {
    setBuscando(true);
    setMostrarPedido(false);
    sessionStorage.setItem("gps_perguntado", "sim");
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
      try { sessionStorage.setItem("mca_endereco_cache", JSON.stringify(gps)); } catch {}
      window.dispatchEvent(new Event("endereco-atualizado"));
      // Salva no perfil
      if (accessToken && gps.cidade) {
        fetch("/api/usuarios/endereco", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
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
        <div className="fixed left-4 right-4 top-20 z-[80] mx-auto max-w-sm rounded-xl border border-[var(--color-linha)] bg-[var(--color-papel)] p-4 shadow-xl sm:left-auto sm:right-5 sm:w-80 animate-[entrada-suave_300ms_ease]">
          <div className="flex items-start gap-3">
            <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-sage)]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--color-texto)]">Sua localização</p>
              <p className="text-xs text-[var(--color-texto-suave)] mt-1">
                Podemos usar seu GPS para mostrar ofertas próximas e preencher o endereço automaticamente?
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={solicitarGps} className="text-xs font-semibold bg-[var(--color-berry)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-berry-escuro)] transition-colors cursor-pointer">
                  {buscando ? "Buscando..." : "Permitir"}
                </button>
                <button onClick={() => { setMostrarPedido(false); sessionStorage.setItem("gps_perguntado", "sim"); }} className="text-xs font-medium text-[var(--color-texto-suave)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-linha)] transition-colors cursor-pointer">
                  Agora não
                </button>
              </div>
            </div>
            <button onClick={() => { setMostrarPedido(false); sessionStorage.setItem("gps_perguntado", "sim"); }} className="p-1 text-[var(--color-texto-suave)]/50 hover:text-[var(--color-texto-suave)] cursor-pointer">
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
    return (
      <Link
        href="/perfil"
        className="flex items-center gap-1.5 rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-1.5 text-xs font-medium text-[var(--color-texto-suave)] hover:text-[var(--color-berry)] transition-colors"
        suppressHydrationWarning
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        Adicionar endereço
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className="flex items-center gap-1.5 rounded-full border border-[var(--color-linha)] bg-[var(--color-papel)] px-3 py-1.5 text-xs transition-colors hover:border-[var(--color-berry)]"
      suppressHydrationWarning
    >
      {dados.origem === "gps" ? (
        <Navigation className="h-3.5 w-3.5 shrink-0 text-[var(--color-sage)]" />
      ) : (
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-ouro)]" />
      )}
      <span className="truncate font-medium text-[var(--color-texto)]">
        {[dados.cidade, cepFormatado ? `CEP ${cepFormatado}` : null].filter(Boolean).join(" · ")}
      </span>
    </Link>
  );
}
