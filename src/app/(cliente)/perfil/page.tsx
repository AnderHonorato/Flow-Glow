"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao } from "@/components/ui";
import { Cabecalho, Rodape } from "@/components/layout";

export default function PaginaPerfil() {
  const { usuario, accessToken } = useAutenticacao();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (usuario) {
      setNomeCompleto(usuario.nomeCompleto);
      setWhatsapp(usuario.whatsapp || "");
      setFotoPerfilUrl(usuario.fotoPerfilUrl || "");
    }
  }, [usuario]);

  // Busca o endereço salvo ao carregar a página.
  useEffect(() => {
    async function buscarEndereco() {
      if (!accessToken) return;
      try {
        const resposta = await fetch("/api/usuarios/endereco", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const dados = await resposta.json();
        if (dados.sucesso && dados.dados) {
          setCep(dados.dados.cep || "");
          setLogradouro(dados.dados.logradouro || "");
          setNumero(dados.dados.numero || "");
          setComplemento(dados.dados.complemento || "");
          setBairro(dados.dados.bairro || "");
          setCidade(dados.dados.cidade || "");
          setEstado(dados.dados.estado || "");
        }
      } catch {}
    }
    buscarEndereco();
  }, [accessToken]);

  // Consulta o CEP na ViaCEP assim que o campo perde o foco.
  async function handleCepBlur() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const resposta = await fetch(`/api/cep/${cepLimpo}`);
      const dados = await resposta.json();

      if (dados.sucesso) {
        setLogradouro(dados.dados.logradouro);
        setBairro(dados.dados.bairro);
        setCidade(dados.dados.cidade);
        setEstado(dados.dados.estado);
        setComplemento(dados.dados.complemento || "");
        setMensagem("CEP encontrado! Confira os dados.");
      } else {
        setErro(dados.erro || "CEP não encontrado.");
      }
    } catch {
      setErro("Erro ao consultar o CEP.");
    }
  }

  // Formata o WhatsApp com máscara (XX) XXXXX-XXXX enquanto digita.
  function formatarWhatsApp(valor: string): string {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  async function handleSalvarPerfil(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/usuarios/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ nomeCompleto, whatsapp, fotoPerfilUrl }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) setMensagem("Perfil atualizado!");
      else setErro(dados.erro);
    } catch {
      setErro("Erro de conexão.");
    }

    setSalvando(false);
  }

  async function handleSalvarEndereco(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/usuarios/endereco", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cep: cep.replace(/\D/g, ""),
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
        }),
      });
      const dados = await resposta.json();
      if (dados.sucesso) setMensagem("Endereço atualizado!");
      else setErro(dados.erro);
    } catch {
      setErro("Erro de conexão.");
    }

    setSalvando(false);
  }

  return (
    <>
      <Cabecalho />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold mb-8">Meu Perfil</h1>

        {mensagem && (
          <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg mb-4">{mensagem}</p>
        )}
        {erro && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{erro}</p>
        )}

        {/* Dados pessoais */}
        <Cartao className="mb-6">
          <h2 className="font-serif text-xl font-bold mb-4">Dados Pessoais</h2>
          <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-4">
            <CampoTexto
              rotulo="Nome completo"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
            <CampoTexto
              rotulo="WhatsApp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatarWhatsApp(e.target.value))}
              placeholder="(XX) XXXXX-XXXX"
            />
            <Botao type="submit" carregando={salvando}>
              Salvar Perfil
            </Botao>
          </form>
        </Cartao>

        {/* Endereço com autopreenchimento por CEP */}
        <Cartao>
          <h2 className="font-serif text-xl font-bold mb-4">Endereço</h2>
          <form onSubmit={handleSalvarEndereco} className="flex flex-col gap-4">
            <CampoTexto
              rotulo="CEP"
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onBlur={handleCepBlur}
              placeholder="00000000"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <CampoTexto rotulo="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
              </div>
              <CampoTexto rotulo="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
            </div>
            <CampoTexto rotulo="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
            <CampoTexto rotulo="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoTexto rotulo="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              <CampoTexto rotulo="Estado" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))} />
            </div>
            <Botao type="submit" carregando={salvando}>
              Salvar Endereço
            </Botao>
          </form>
        </Cartao>
      </main>
      <Rodape />
    </>
  );
}
