"use client";

import {
  Camera,
  KeyRound,
  LogOut,
  MailCheck,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Cabecalho, Rodape } from "@/components/layout";
import { AvatarUsuario, Botao, CampoTexto, Cartao, Modal } from "@/components/ui";
import { useAutenticacao } from "@/contexto/autenticacao";
import { usePreferencias } from "@/contexto/preferencias";

async function recortarImagemPerfil(arquivo: File): Promise<string> {
  if (!arquivo.type.startsWith("image/")) throw new Error("Escolha uma imagem válida.");
  if (arquivo.size > 4 * 1024 * 1024) throw new Error("Use uma imagem de até 4 MB.");

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(String(leitor.result));
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.readAsDataURL(arquivo);
  });

  const imagem = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível abrir a imagem."));
    img.src = dataUrl;
  });

  const ladoOrigem = Math.min(imagem.naturalWidth, imagem.naturalHeight);
  const sx = Math.round((imagem.naturalWidth - ladoOrigem) / 2);
  const sy = Math.round((imagem.naturalHeight - ladoOrigem) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 384;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não preparou a imagem.");
  ctx.drawImage(imagem, sx, sy, ladoOrigem, ladoOrigem, 0, 0, 384, 384);

  return canvas.toDataURL("image/jpeg", 0.84);
}

function formatarCpf(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function dataParaInput(valor: string | null) {
  return valor ? valor.slice(0, 10) : "";
}

export default function PaginaPerfil() {
  const router = useRouter();
  const { usuario, accessToken, atualizarUsuario, logout } = useAutenticacao();
  const {
    localizacao,
    carregandoLocalizacao,
    erroLocalizacao,
    solicitarLocalizacao,
    limparLocalizacao,
  } = usePreferencias();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [apelido, setApelido] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [profissao, setProfissao] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [codigoConfirmacaoEmail, setCodigoConfirmacaoEmail] = useState("");
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoNovaSenha, setConfirmacaoNovaSenha] = useState("");
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
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [excluindoConta, setExcluindoConta] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    setNomeCompleto(usuario.nomeCompleto);
    setApelido(usuario.apelido || "");
    setCpf(formatarCpf(usuario.cpf || ""));
    setDataNascimento(dataParaInput(usuario.dataNascimento));
    setGenero(usuario.genero || "");
    setProfissao(usuario.profissao || "");
    setWhatsapp(formatarTelefone(usuario.whatsapp || ""));
    setTelefone(formatarTelefone(usuario.telefone || ""));
    setEmail(usuario.email);
    setFotoPerfilUrl(usuario.fotoPerfilUrl || "");
  }, [usuario]);

  useEffect(() => {
    async function buscarEndereco() {
      if (!accessToken) return;
      try {
        const resposta = await fetch("/api/usuarios/endereco", {
          credentials: "include",
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

  async function handleCepBlur() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const resposta = await fetch(`/api/cep/${cepLimpo}`);
      const dados = await resposta.json();
      if (dados.sucesso) {
        setLogradouro(dados.dados.logradouro || "");
        setBairro(dados.dados.bairro || "");
        setCidade(dados.dados.cidade || "");
        setEstado(dados.dados.estado || "");
        setComplemento(dados.dados.complemento || "");
        setMensagem("CEP encontrado. Confira os dados.");
      } else {
        setErro(dados.erro || "CEP não encontrado.");
      }
    } catch {
      setErro("Erro ao consultar o CEP.");
    }
  }

  async function escolherFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setErro("");
    setMensagem("");
    setProcessandoFoto(true);
    try {
      const recortada = await recortarImagemPerfil(arquivo);
      setFotoPerfilUrl(recortada);
      setMensagem("Foto recortada. Salve o perfil para aplicar.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível preparar a foto.");
    }
    setProcessandoFoto(false);
    evento.target.value = "";
  }

  function montarPayloadPerfil(extra?: Record<string, string>) {
    return {
      nomeCompleto,
      apelido,
      cpf,
      email,
      codigoConfirmacaoEmail,
      whatsapp,
      telefone,
      dataNascimento,
      genero,
      profissao,
      fotoPerfilUrl,
      ...extra,
    };
  }

  async function salvarPerfil(e?: FormEvent) {
    e?.preventDefault();
    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      const resposta = await fetch("/api/usuarios/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(montarPayloadPerfil()),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        atualizarUsuario(dados.dados);
        setCodigoConfirmacaoEmail("");
        setMensagem("Perfil atualizado.");
      } else {
        setErro(dados.erro);
      }
    } catch {
      setErro("Erro de conexão.");
    }

    setSalvando(false);
  }

  async function trocarSenha(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");
    if (!senhaAtual || !novaSenha || !confirmacaoNovaSenha) {
      setErro("Informe senha atual, nova senha e confirmação.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await fetch("/api/usuarios/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(
          montarPayloadPerfil({ senhaAtual, novaSenha, confirmacaoNovaSenha })
        ),
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        atualizarUsuario(dados.dados);
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmacaoNovaSenha("");
        setMensagem("Senha atualizada com confirmação da senha atual.");
      } else {
        setErro(dados.erro);
      }
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
        },
        credentials: "include",
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
      if (dados.sucesso) setMensagem("Endereço atualizado.");
      else setErro(dados.erro);
    } catch {
      setErro("Erro de conexão.");
    }

    setSalvando(false);
  }

  async function trocarConta() {
    await logout();
    router.push("/login");
  }

  async function deletarConta() {
    if (!accessToken) return;

    setErro("");
    setMensagem("");
    setExcluindoConta(true);
    try {
      const resposta = await fetch("/api/usuarios/perfil", {
        method: "DELETE",
        credentials: "include",
      });
      const dados = await resposta.json();
      if (dados.sucesso) {
        setConfirmarExclusao(false);
        await logout();
        router.push("/");
      } else {
        setErro(dados.erro || "Não foi possível excluir a conta.");
      }
    } catch {
      setErro("Erro de conexão ao excluir a conta.");
    }
    setExcluindoConta(false);
  }

  return (
    <>
      <Cabecalho />
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5">
          <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
            <UserRound className="h-4 w-4" aria-hidden />
            Minha conta
          </span>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Perfil, segurança e preferências</h1>
        </div>

        {mensagem && (
          <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            {mensagem}
          </p>
        )}
        {erro && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {erro}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            <Cartao>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <AvatarUsuario nome={nomeCompleto} fotoUrl={fotoPerfilUrl} tamanho="grande" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">Dados pessoais</h2>
                  <p className="mt-1 text-sm text-[var(--color-texto-suave)]">
                    As mesmas informações do cadastro ficam disponíveis para edição.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-3 py-2 text-sm font-semibold text-[var(--color-texto)] hover:border-[var(--color-berry)] hover:text-[var(--color-berry)]">
                  <Camera className="h-4 w-4" aria-hidden />
                  {processandoFoto ? "Preparando..." : "Trocar foto"}
                  <input type="file" accept="image/*" className="sr-only" onChange={escolherFoto} disabled={processandoFoto} />
                </label>
              </div>

              <form onSubmit={salvarPerfil} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto rotulo="Nome completo" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                  <CampoTexto rotulo="Apelido" value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Opcional" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto rotulo="CPF" value={cpf} onChange={(e) => setCpf(formatarCpf(e.target.value))} inputMode="numeric" />
                  <CampoTexto rotulo="Data de nascimento" type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-[var(--color-texto)]">Gênero</span>
                    <select
                      value={genero}
                      onChange={(e) => setGenero(e.target.value)}
                      className="h-10 rounded-lg border border-[var(--color-linha-forte)] bg-[var(--color-papel)] px-3 text-sm text-[var(--color-texto)] outline-none focus:border-[var(--color-berry)] sm:h-11"
                    >
                      <option value="">Prefiro não informar</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                      <option value="nao-binario">Não binário</option>
                      <option value="outro">Outro</option>
                    </select>
                  </label>
                  <CampoTexto rotulo="Profissão" value={profissao} onChange={(e) => setProfissao(e.target.value)} placeholder="Opcional" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto rotulo="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))} inputMode="tel" />
                  <CampoTexto rotulo="Telefone alternativo" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} inputMode="tel" />
                </div>
                <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                  <CampoTexto rotulo="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <CampoTexto rotulo="Código e-mail" value={codigoConfirmacaoEmail} onChange={(e) => setCodigoConfirmacaoEmail(e.target.value)} placeholder="123456" />
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-texto-suave)]">
                  Por enquanto a confirmação de troca de e-mail é fictícia: use o código 123456.
                </p>
                <Botao type="submit" carregando={salvando} className="sm:w-fit">
                  <Save className="h-4 w-4" aria-hidden />
                  Salvar perfil
                </Botao>
              </form>
            </Cartao>

            <Cartao>
              <h2 className="text-xl font-bold">Endereço principal</h2>
              <form onSubmit={handleSalvarEndereco} className="mt-4 grid gap-4">
                <CampoTexto rotulo="CEP" value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))} onBlur={handleCepBlur} placeholder="00000000" inputMode="numeric" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <CampoTexto rotulo="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
                  </div>
                  <CampoTexto rotulo="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
                </div>
                <CampoTexto rotulo="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <CampoTexto rotulo="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                  <CampoTexto rotulo="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                  <CampoTexto rotulo="Estado" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))} />
                </div>
                <Botao type="submit" carregando={salvando} className="sm:w-fit">
                  <Save className="h-4 w-4" aria-hidden />
                  Salvar endereço
                </Botao>
              </form>
            </Cartao>

            <Cartao>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <ShieldCheck className="h-5 w-5 text-[var(--color-sage)]" aria-hidden />
                Senha
              </h2>
              <form onSubmit={trocarSenha} className="mt-4 grid gap-4">
                <CampoTexto rotulo="Senha atual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} icone={<KeyRound className="h-4 w-4" aria-hidden />} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto rotulo="Nova senha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="8 caracteres, 1 maiúscula e 1 número" />
                  <CampoTexto rotulo="Confirmar nova senha" type="password" value={confirmacaoNovaSenha} onChange={(e) => setConfirmacaoNovaSenha(e.target.value)} />
                </div>
                <Botao type="submit" variante="secundario" carregando={salvando} className="sm:w-fit">
                  <MailCheck className="h-4 w-4" aria-hidden />
                  Trocar senha
                </Botao>
              </form>
            </Cartao>
          </div>

          <aside className="space-y-5">
            <Cartao destaque>
              <MapPin className="mb-3 h-5 w-5 text-[var(--color-sage)]" aria-hidden />
              <h2 className="text-lg font-bold">Localização</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto-suave)]">
                Use sua posição para organizar filtros por distância. O acesso é pedido apenas quando você clicar.
              </p>
              {localizacao ? (
                <div className="mt-4 rounded-lg bg-[color-mix(in_srgb,var(--color-sage)_10%,transparent)] p-3 text-sm font-semibold text-[var(--color-sage)]">
                  Localização ativa
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--color-texto-suave)]">Nenhuma localização salva.</p>
              )}
              {erroLocalizacao && <p className="mt-2 text-xs text-red-600">{erroLocalizacao}</p>}
              <div className="mt-4 grid gap-2">
                <Botao type="button" onClick={solicitarLocalizacao} carregando={carregandoLocalizacao}>
                  <MapPin className="h-4 w-4" aria-hidden />
                  Usar minha localização
                </Botao>
                {localizacao && (
                  <Botao type="button" variante="fantasma" onClick={limparLocalizacao}>
                    Remover localização
                  </Botao>
                )}
              </div>
            </Cartao>

            <Cartao>
              <h2 className="text-lg font-bold">Acesso</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto-suave)]">
                Troque de conta ou remova seu cadastro deste ambiente de testes.
              </p>
              <div className="mt-4 grid gap-2">
                <Botao type="button" variante="contorno" onClick={trocarConta}>
                  <LogOut className="h-4 w-4" aria-hidden />
                  Trocar de conta
                </Botao>
                <Botao type="button" variante="perigo" onClick={() => setConfirmarExclusao(true)}>
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Deletar conta
                </Botao>
              </div>
            </Cartao>
          </aside>
        </div>
      </main>
      <Modal
        aberto={confirmarExclusao}
        titulo="Deletar conta"
        descricao="Esta ação remove perfil, pedidos, comentários e conversas deste ambiente."
        onFechar={() => setConfirmarExclusao(false)}
      >
        <div className="grid gap-4">
          <p className="text-sm leading-relaxed text-[var(--color-texto-suave)]">
            Confirme apenas se deseja apagar a conta atual e sair do sistema.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Botao variante="contorno" onClick={() => setConfirmarExclusao(false)}>
              Cancelar
            </Botao>
            <Botao variante="perigo" onClick={deletarConta} carregando={excluindoConta}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Deletar conta
            </Botao>
          </div>
        </div>
      </Modal>
      <Rodape />
    </>
  );
}
