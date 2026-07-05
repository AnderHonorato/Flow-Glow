"use client";

import { MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";

interface EnderecoUsuario {
  cidade: string;
  estado: string;
  cep: string;
}

export function BarraLocalizacao() {
  const { usuario, accessToken } = useAutenticacao();

  const [cidade, setCidade] = useState<string | null>(null);
  const [cep, setCep] = useState<string | null>(null);
  const [modo, setModo] = useState<"geolocalizacao" | "cadastro" | "nenhum">("nenhum");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Prioridade 1: geolocalização do navegador (com permissão explícita)
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (posicao) => {
          try {
            const { latitude, longitude } = posicao.coords;
            // Geocodificação reversa gratuita via Nominatim (OpenStreetMap)
            const resposta = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1&accept-language=pt-BR`
            );
            const dados = await resposta.json();
            const cidadeGeo =
              dados.address?.city ||
              dados.address?.town ||
              dados.address?.municipality ||
              dados.address?.suburb ||
              "";
            const cepGeo = dados.address?.postcode || "";

            if (cidadeGeo) {
              setCidade(cidadeGeo);
              setCep(cepGeo);
              setModo("geolocalizacao");
              setCarregando(false);
              return;
            }
          } catch {
            // Falha na geocodificação — tenta fallback pelo cadastro
          }
          // Se chegou aqui, tenta o endereço cadastrado
          await buscarEnderecoCadastro();
        },
        async () => {
          // Usuário negou ou navegador não suporta — usa endereço do cadastro
          await buscarEnderecoCadastro();
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      buscarEnderecoCadastro();
    }

    async function buscarEnderecoCadastro() {
      if (!usuario || !accessToken) {
        setCarregando(false);
        return;
      }
      try {
        const resposta = await fetch("/api/usuarios/endereco", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const dados = await resposta.json();
        if (dados.sucesso && dados.dados) {
          const end: EnderecoUsuario = dados.dados;
          if (end.cidade) {
            setCidade(end.cidade);
            setCep(end.cep);
            setModo("cadastro");
            setCarregando(false);
            return;
          }
        }
      } catch {}
      setCarregando(false);
    }
  }, [usuario, accessToken]);

  function formatarCep(cepBruto: string): string {
    const limpo = cepBruto.replace(/\D/g, "").slice(0, 8);
    if (limpo.length === 8) return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
    return cepBruto;
  }

  if (carregando) return null;
  if (!cidade && !cep) return null;

  const etiquetaModo = modo === "geolocalizacao" ? "Localização atual" : "Endereço cadastrado";

  return (
    <div className="border-b border-[#eadfd5] bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-sm sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {modo === "geolocalizacao" ? (
            <Navigation className="h-4 w-4 text-[var(--color-sage)]" />
          ) : (
            <MapPin className="h-4 w-4 text-[var(--color-berry)]" />
          )}
          <span className="text-xs text-[#715f55]">{etiquetaModo}</span>
        </div>
        <span className="font-medium text-[#2a211d]">
          {[cidade, cep ? `CEP ${formatarCep(cep)}` : null].filter(Boolean).join(", ")}
        </span>
        {/* Botão pequeno para trocar/atualizar localização */}
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && "geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                () => window.location.reload(),
                () => {},
                { timeout: 8000 }
              );
            }
          }}
          className="ml-auto text-xs text-[var(--color-berry)] hover:underline cursor-pointer shrink-0"
        >
          {modo === "geolocalizacao" ? "Atualizar" : "Usar GPS"}
        </button>
      </div>
    </div>
  );
}
