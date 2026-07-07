"use client";

import { CalendarDays, CreditCard, KeyRound, Mail, MapPin, Phone, UserRound, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

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

export default function PaginaCadastro() {
  const router = useRouter();
  const { cadastro, carregando } = useAutenticacao();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [apelido, setApelido] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [profissao, setProfissao] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function buscarCep(cepBruto: string) {
    const limpo = cepBruto.replace(/\D/g, "").slice(0, 8);
    if (limpo.length !== 8) return;
    try {
      const r = await fetch(`/api/cep/${limpo}`);
      const d = await r.json();
      if (d.sucesso) {
        setLogradouro(d.dados.logradouro || "");
        setBairro(d.dados.bairro || "");
        setCidade(d.dados.cidade || "");
        setEstado(d.dados.estado || "");
        setComplemento(d.dados.complemento || "");
      }
    } catch {}
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    const obrigatorios = [
      nomeCompleto,
      cpf,
      dataNascimento,
      whatsapp,
      email,
      senha,
      confirmacaoSenha,
      cep,
      logradouro,
      numero,
      bairro,
      cidade,
      estado,
    ];

    if (obrigatorios.some((campo) => !campo.trim())) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmacaoSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    if (senha.length < 8 || !/[A-Z]/.test(senha) || !/[0-9]/.test(senha)) {
      setErro("A senha precisa ter 8 caracteres, 1 letra maiúscula e 1 número.");
      return;
    }

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os termos de uso e a política de privacidade.");
      return;
    }

    setEnviando(true);
    const resultado = await cadastro({
      nomeCompleto,
      apelido,
      cpf,
      dataNascimento,
      genero,
      profissao,
      whatsapp,
      telefone,
      email,
      senha,
      confirmacaoSenha,
      aceitouTermos,
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado: estado.toUpperCase().slice(0, 2),
    });
    setEnviando(false);

    if (resultado.sucesso) router.push("/tutoriais");
    else setErro(resultado.erro || "Erro ao criar conta.");
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-linha)] border-t-[var(--color-berry)]" />
      </div>
    );
  }

  return (
    <Cartao>
      <div className="mb-5 text-center">
        <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-sage)]/10 text-[var(--color-sage)]">
          <UserPlus className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-2 text-sm text-[var(--color-texto)]/60">
          Dados completos ajudam entrega, suporte e segurança da compra.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="Nome completo"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            placeholder="Como no documento"
            autoComplete="name"
            icone={<UserRound className="h-4 w-4" aria-hidden />}
          />
          <CampoTexto
            rotulo="Apelido"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            placeholder="Opcional"
            autoComplete="nickname"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            placeholder="000.000.000-00"
            inputMode="numeric"
            icone={<CreditCard className="h-4 w-4" aria-hidden />}
          />
          <CampoTexto
            rotulo="Data de nascimento"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            icone={<CalendarDays className="h-4 w-4" aria-hidden />}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
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
          <CampoTexto
            rotulo="Profissão"
            value={profissao}
            onChange={(e) => setProfissao(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatarTelefone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="tel"
            autoComplete="tel"
            icone={<Phone className="h-4 w-4" aria-hidden />}
          />
          <CampoTexto
            rotulo="Telefone alternativo"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="Opcional"
            inputMode="tel"
          />
        </div>

        <div className="rounded-lg border border-[var(--color-linha)] p-3 sm:p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-texto)]">
            <MapPin className="h-4 w-4" aria-hidden /> Endereço principal
          </p>
          <div className="grid gap-3">
            <CampoTexto
              rotulo="CEP"
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onBlur={() => buscarCep(cep)}
              placeholder="00000000"
              inputMode="numeric"
              autoComplete="postal-code"
            />
            <div className="grid grid-cols-[1fr_6.5rem] gap-3">
              <CampoTexto rotulo="Logradouro" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Rua" />
              <CampoTexto rotulo="Número" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
            </div>
            <CampoTexto rotulo="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, bloco, referência" />
            <div className="grid gap-3 sm:grid-cols-3">
              <CampoTexto rotulo="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
              <CampoTexto rotulo="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
              <CampoTexto rotulo="Estado" value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" />
            </div>
          </div>
        </div>

        <CampoTexto
          rotulo="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          icone={<Mail className="h-4 w-4" aria-hidden />}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <CampoTexto
            rotulo="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="8 caracteres, 1 maiúscula e 1 número"
            autoComplete="new-password"
            icone={<KeyRound className="h-4 w-4" aria-hidden />}
          />
          <CampoTexto
            rotulo="Confirmar senha"
            type="password"
            value={confirmacaoSenha}
            onChange={(e) => setConfirmacaoSenha(e.target.value)}
            placeholder="Repita a senha"
            autoComplete="new-password"
            icone={<KeyRound className="h-4 w-4" aria-hidden />}
          />
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-3 text-sm text-[var(--color-texto)]/72">
          <input
            type="checkbox"
            checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--color-berry)]"
          />
          <span>
            Eu li e aceito os{" "}
            <Link href="/termos-de-uso" target="_blank" className="font-semibold text-[var(--color-berry)] hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link href="/politica-de-privacidade" target="_blank" className="font-semibold text-[var(--color-berry)] hover:underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>

        {erro && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {erro}
          </p>
        )}

        <Botao type="submit" tamanho="grande" carregando={enviando} className="w-full">
          <UserPlus className="h-5 w-5" aria-hidden />
          Criar conta
        </Botao>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-texto)]/60">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-berry)] hover:underline">
          Entrar
        </Link>
      </p>
    </Cartao>
  );
}
