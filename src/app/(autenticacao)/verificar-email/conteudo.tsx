"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Botao, Cartao } from "@/components/ui";
import { CampoTexto } from "@/components/ui/campo-texto";

export default function ConteudoVerificarEmail() {
  const searchParams = useSearchParams();
  const { verificarEmail } = useAutenticacao();

  const tokenParam = searchParams.get("token");
  const [status, setStatus] = useState<"verificando" | "sucesso" | "erro">(
    tokenParam ? "verificando" : "erro"
  );
  const [mensagem, setMensagem] = useState("");
  const [tokenManual, setTokenManual] = useState("");
  const [enviandoManual, setEnviandoManual] = useState(false);

  useEffect(() => {
    if (tokenParam) {
      verificarEmail(tokenParam).then((resultado) => {
        if (resultado.sucesso) {
          setStatus("sucesso");
          setMensagem("E-mail verificado com sucesso!");
        } else {
          setStatus("erro");
          setMensagem(resultado.erro || "Token inválido ou expirado.");
        }
      });
    }
  }, [tokenParam, verificarEmail]);

  async function handleVerificarManual() {
    if (!tokenManual.trim()) return;
    setEnviandoManual(true);
    const resultado = await verificarEmail(tokenManual.trim());
    setEnviandoManual(false);

    if (resultado.sucesso) {
      setStatus("sucesso");
      setMensagem("E-mail verificado com sucesso!");
    } else {
      setMensagem(resultado.erro || "Token inválido.");
    }
  }

  return (
    <Cartao className="text-center">
      <h1 className="font-serif text-2xl font-bold mb-4">
        {status === "verificando" && "Verificando e-mail..."}
        {status === "sucesso" && "E-mail Verificado"}
        {status === "erro" && !tokenParam && "Verificar E-mail"}
        {status === "erro" && tokenParam && "Erro na Verificação"}
      </h1>

      {status === "verificando" && (
        <div className="flex justify-center py-6">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-bege)] border-t-[var(--color-berry)] rounded-full" />
        </div>
      )}

      {status === "sucesso" && (
        <>
          <p className="text-[var(--color-texto)]/60 mb-6">
            {mensagem} Sua conta está ativa e pronta para uso.
          </p>
          <Link href="/meus-tutoriais">
            <Botao variante="primario" tamanho="medio">
              Ir para Meus Tutoriais
            </Botao>
          </Link>
        </>
      )}

      {status === "erro" && !tokenParam && (
        <>
          <p className="text-[var(--color-texto)]/60 mb-6">
            Cole abaixo o código de verificação enviado para seu e-mail.
          </p>
          <div className="flex flex-col gap-4">
            <CampoTexto
              rotulo="Código de verificação"
              value={tokenManual}
              onChange={(e) => setTokenManual(e.target.value)}
              placeholder="Cole o token aqui"
            />
            {mensagem && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {mensagem}
              </p>
            )}
            <Botao
              onClick={handleVerificarManual}
              carregando={enviandoManual}
              tamanho="grande"
            >
              Verificar
            </Botao>
          </div>
        </>
      )}

      {status === "erro" && tokenParam && (
        <>
          <p className="text-[var(--color-texto)]/60 mb-6">{mensagem}</p>
          <Link href="/login">
            <Botao variante="contorno" tamanho="medio">
              Voltar ao Login
            </Botao>
          </Link>
        </>
      )}
    </Cartao>
  );
}
