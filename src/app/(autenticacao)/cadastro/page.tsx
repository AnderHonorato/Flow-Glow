"use client";

import { CreditCard, KeyRound, Mail, MapPin, UserRound, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

export default function PaginaCadastro() {
  const router = useRouter();
  const { cadastro, carregando } = useAutenticacao();

  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
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

    if (!nomeCompleto || !cpf || !email || !senha || !confirmacaoSenha || !cep || !logradouro || !numero || !bairro || !cidade || !estado) {
      setErro("Preencha todos os campos.");
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
      cpf: cpf.replace(/\D/g, ""),
      email,
      senha,
      confirmacaoSenha,
      aceitouTermos,
      cep: cep.replace(/\D/g, ""),
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado: estado.toUpperCase().slice(0, 2),
    });
    setEnviando(false);

    if (resultado.sucesso) {
      router.push("/tutoriais");
    } else {
      setErro(resultado.erro || "Erro ao criar conta.");
    }
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
      <div className="mb-6 text-center">
        <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-sage)]/10 text-[var(--color-sage)]">
          <UserPlus className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">Criar conta</h1>
        <p className="mt-2 text-sm text-[var(--color-texto)]/60">
          Crie um acesso para testar carrinho, checkout e avaliações.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <CampoTexto
          rotulo="Nome completo"
          type="text"
          value={nomeCompleto}
          onChange={(e) => setNomeCompleto(e.target.value)}
          placeholder="Seu nome completo"
          autoComplete="name"
          icone={<UserRound className="h-4 w-4" aria-hidden />}
        />

        <CampoTexto
          rotulo="CPF"
          type="text"
          value={cpf}
          onChange={(e) => {
            const numeros = e.target.value.replace(/\D/g, "").slice(0, 11);
            setCpf(numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"));
          }}
          placeholder="000.000.000-00"
          autoComplete="off"
          icone={<CreditCard className="h-4 w-4" aria-hidden />}
        />

        <div className="rounded-lg border border-[#eadfd5] p-4 space-y-3">
          <p className="text-sm font-bold text-[#2a211d] flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Endereço de entrega
          </p>
          <CampoTexto
            rotulo="CEP"
            type="text"
            value={cep}
            onChange={(e) => { setCep(e.target.value.replace(/\D/g, "").slice(0, 8)); }}
            onBlur={() => buscarCep(cep)}
            placeholder="00000000"
            autoComplete="postal-code"
          />
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <CampoTexto rotulo="Logradouro" value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Rua" />
            </div>
            <CampoTexto rotulo="Número" value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" />
          </div>
          <CampoTexto rotulo="Complemento" value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, bloco (opcional)" />
          <CampoTexto rotulo="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <CampoTexto rotulo="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
            <CampoTexto rotulo="Estado" value={estado} onChange={e => setEstado(e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" />
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
