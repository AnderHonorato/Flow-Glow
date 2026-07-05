"use client";

import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { AvatarUsuario, Botao, CampoTexto, Cartao } from "@/components/ui";
import type { ComentarioDetalhe } from "@/tipos";

interface SecaoComentariosProps {
  tutorialId: string;
  comentariosIniciais: ComentarioDetalhe[];
}

export default function SecaoComentarios({
  tutorialId,
  comentariosIniciais,
}: SecaoComentariosProps) {
  const { usuario, accessToken } = useAutenticacao();

  const [comentarios, setComentarios] = useState(comentariosIniciais);
  const [nota, setNota] = useState(5);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleEnviarComentario(e: FormEvent) {
    e.preventDefault();
    setErro("");
    setMensagem("");

    if (!usuario) {
      setErro("Você precisa estar logado para comentar.");
      return;
    }

    if (!texto.trim() || texto.trim().length < 3) {
      setErro("O comentário deve ter pelo menos 3 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const resposta = await fetch("/api/comentarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tutorialId, nota, texto }),
      });

      const dados = await resposta.json();

      if (dados.sucesso) {
        setComentarios((atuais) => [
          {
            id: dados.dados.id,
            nota,
            texto,
            usuario: {
              nomeCompleto: usuario.nomeCompleto,
              fotoPerfilUrl: usuario.fotoPerfilUrl,
            },
            anexos: [],
            criadoEm: new Date().toISOString(),
            editadoEm: new Date().toISOString(),
          },
          ...atuais,
        ]);
        setMensagem("Avaliação enviada.");
        setTexto("");
      } else {
        setErro(dados.erro || "Não foi possível enviar a avaliação.");
      }
    } catch {
      setErro("Erro de conexão ao enviar comentário.");
    }
    setEnviando(false);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Avaliações ({comentarios.length})</h2>

      {usuario ? (
        <Cartao className="mt-4">
          <h3 className="font-bold">Deixe sua avaliação</h3>
          <form onSubmit={handleEnviarComentario} className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-1" aria-label="Nota">
              {[1, 2, 3, 4, 5].map((estrela) => (
                <button
                  key={estrela}
                  type="button"
                  onClick={() => setNota(estrela)}
                  className="rounded-md p-1 text-[var(--color-linha-forte)] transition-colors hover:text-[var(--color-ouro)]"
                  aria-label={`${estrela} estrela${estrela > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-6 w-6 ${
                      estrela <= nota
                        ? "fill-[var(--color-ouro)] text-[var(--color-ouro)]"
                        : ""
                    }`}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
            <CampoTexto
              rotulo="Seu comentário"
              as="textarea"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Conte sua experiência com este anúncio..."
            />
            {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}
            {mensagem && <p className="text-sm font-medium text-green-700">{mensagem}</p>}
            <Botao type="submit" carregando={enviando}>
              Enviar avaliação
            </Botao>
          </form>
        </Cartao>
      ) : (
        <p className="mt-3 text-sm text-[var(--color-texto)]/56">
          Faça login para deixar sua avaliação.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {comentarios.map((comentario) => (
          <Cartao key={comentario.id}>
            <div className="flex items-start gap-3">
              <AvatarUsuario
                nome={comentario.usuario.nomeCompleto}
                fotoUrl={comentario.usuario.fotoPerfilUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{comentario.usuario.nomeCompleto}</span>
                  <span className="flex items-center gap-0.5 text-[var(--color-ouro)]">
                    {Array.from({ length: comentario.nota }).map((_, indice) => (
                      <Star key={indice} className="h-4 w-4 fill-current" aria-hidden />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto)]/70">
                  {comentario.texto}
                </p>
                <span className="mt-2 block text-xs text-[var(--color-texto)]/42">
                  {new Date(comentario.criadoEm).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
