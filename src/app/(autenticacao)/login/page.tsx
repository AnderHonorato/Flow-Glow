"use client";

import { KeyRound, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

const contasTeste = [
  { papel: "Admin", email: "admin@studioglow.com.br", senha: "Admin123" },
  { papel: "Cliente", email: "cliente@studioglow.com.br", senha: "Cliente123" },
];

export default function PaginaLogin() {
  const router = useRouter();
  const { login, carregando } = useAutenticacao();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha todos os campos.");
      return;
    }

    setEnviando(true);
    const resultado = await login(email, senha);
    setEnviando(false);

    if (resultado.sucesso) {
      router.push("/meus-tutoriais");
    } else {
      setErro(resultado.erro || "Erro ao fazer login.");
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
        <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-berry)]/10 text-[var(--color-berry)]">
          <LogIn className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-2 text-sm text-[var(--color-texto)]/60">
          Acesse sua conta para comprar, comentar e testar o painel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="Sua senha"
          autoComplete="current-password"
          icone={<KeyRound className="h-4 w-4" aria-hidden />}
        />

        {erro && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {erro}
          </p>
        )}

        <Botao type="submit" tamanho="grande" carregando={enviando} className="w-full">
          <LogIn className="h-5 w-5" aria-hidden />
          Entrar
        </Botao>
      </form>

      <div className="mt-5 rounded-lg border border-[var(--color-linha)] bg-[var(--color-papel)] p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--color-texto)]/50">
          Contas de teste
        </p>
        <div className="grid gap-2">
          {contasTeste.map((conta) => (
            <button
              key={conta.email}
              type="button"
              onClick={() => {
                setEmail(conta.email);
                setSenha(conta.senha);
              }}
              className="rounded-md bg-white px-3 py-2 text-left text-xs font-semibold text-[var(--color-texto)] ring-1 ring-[var(--color-linha)] hover:ring-[var(--color-berry)]"
            >
              {conta.papel}: {conta.email} / {conta.senha}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2 text-center">
        <p>
          <Link href="/recuperar-senha" className="text-sm font-semibold text-[var(--color-berry)] hover:underline">
            Esqueci minha senha
          </Link>
        </p>
        <p className="text-sm text-[var(--color-texto)]/60">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-[var(--color-berry)] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </Cartao>
  );
}
