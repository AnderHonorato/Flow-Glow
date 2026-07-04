"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

export default function ConteudoRedefinirSenha() {
  const searchParams = useSearchParams();
  const { redefinirSenha } = useAutenticacao();

  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [senha, setSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!token) {
      setErro("Token de recuperação não informado.");
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

    setEnviando(true);
    const resultado = await redefinirSenha(token, senha, confirmacaoSenha);
    setEnviando(false);

    if (resultado.sucesso) {
      setSucesso(true);
    } else {
      setErro(resultado.erro || "Erro ao redefinir senha.");
    }
  }

  if (sucesso) {
    return (
      <Cartao className="text-center">
        <ShieldCheck className="mx-auto mb-3 h-9 w-9 text-[var(--color-sage)]" aria-hidden />
        <h1 className="text-2xl font-bold">Senha alterada</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-texto)]/62">
          Sua senha foi redefinida. Agora você já pode entrar com a nova senha.
        </p>
        <Link href="/login" className="mt-6 inline-flex">
          <Botao>Fazer login</Botao>
        </Link>
      </Cartao>
    );
  }

  return (
    <Cartao>
      <div className="mb-6 text-center">
        <KeyRound className="mx-auto mb-3 h-9 w-9 text-[var(--color-berry)]" aria-hidden />
        <h1 className="text-2xl font-bold">Redefinir senha</h1>
        <p className="mt-2 text-sm text-[var(--color-texto)]/60">
          Escolha uma senha nova para recuperar o acesso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!tokenParam && (
          <CampoTexto
            rotulo="Token de recuperação"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Cole o token do e-mail"
            icone={<KeyRound className="h-4 w-4" aria-hidden />}
          />
        )}

        <CampoTexto
          rotulo="Nova senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="8 caracteres, 1 maiúscula e 1 número"
          autoComplete="new-password"
          icone={<KeyRound className="h-4 w-4" aria-hidden />}
        />

        <CampoTexto
          rotulo="Confirmar nova senha"
          type="password"
          value={confirmacaoSenha}
          onChange={(e) => setConfirmacaoSenha(e.target.value)}
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          icone={<KeyRound className="h-4 w-4" aria-hidden />}
        />

        {erro && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {erro}
          </p>
        )}

        <Botao type="submit" tamanho="grande" carregando={enviando} className="w-full">
          <ShieldCheck className="h-5 w-5" aria-hidden />
          Redefinir senha
        </Botao>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-texto)]/60">
        <Link href="/login" className="font-semibold text-[var(--color-berry)] hover:underline">
          Voltar ao login
        </Link>
      </p>
    </Cartao>
  );
}
