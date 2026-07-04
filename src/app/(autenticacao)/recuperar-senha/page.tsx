"use client";

import { Mail, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

export default function PaginaRecuperarSenha() {
  const { recuperarSenha } = useAutenticacao();

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email) {
      setErro("Informe seu e-mail.");
      return;
    }

    setEnviando(true);
    const resultado = await recuperarSenha(email);
    setEnviando(false);

    if (resultado.sucesso) {
      setEnviado(true);
    } else {
      setErro(resultado.erro || "Erro ao processar solicitação.");
    }
  }

  if (enviado) {
    return (
      <Cartao className="text-center">
        <ShieldCheck className="mx-auto mb-3 h-9 w-9 text-[var(--color-sage)]" aria-hidden />
        <h1 className="text-2xl font-bold">E-mail enviado</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-texto)]/62">
          Se o e-mail estiver cadastrado, você receberá um link para redefinir a
          senha. No ambiente local, o link também aparece no terminal do Next.js.
        </p>
        <Link href="/login" className="mt-6 inline-flex">
          <Botao variante="contorno">Voltar ao login</Botao>
        </Link>
      </Cartao>
    );
  }

  return (
    <Cartao>
      <div className="mb-6 text-center">
        <Mail className="mx-auto mb-3 h-9 w-9 text-[var(--color-berry)]" aria-hidden />
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-[var(--color-texto)]/60">
          Enviaremos um link seguro para criar uma nova senha.
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

        {erro && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {erro}
          </p>
        )}

        <Botao type="submit" tamanho="grande" carregando={enviando} className="w-full">
          <Send className="h-5 w-5" aria-hidden />
          Enviar link
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
