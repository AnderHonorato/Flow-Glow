"use client";

import { FolderPlus, Plus, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Botao, CampoTexto, Cartao } from "@/components/ui";

export default function PaginaAdminCategorias() {
  const [categorias, setCategorias] = useState<{ id: string; nome: string; slug: string }[]>([]);
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    const resposta = await fetch("/api/categorias");
    const dados = await resposta.json();
    if (dados.sucesso) setCategorias(dados.dados);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar() {
    if (!nome.trim()) return;
    setMsg("");
    setErro("");
    const slug = nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const resposta = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome: nome.trim(), slug }),
    });
    const dados = await resposta.json();
    if (dados.sucesso) {
      setNome("");
      setMsg("Categoria criada.");
      carregar();
    } else {
      setErro(dados.erro || "Nao foi possivel criar.");
    }
  }

  async function remover(id: string) {
    setMsg("");
    setErro("");
    const resposta = await fetch(`/api/categorias?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const dados = await resposta.json();
    if (dados.sucesso) {
      setMsg("Categoria removida.");
      carregar();
    } else {
      setErro(dados.erro || "Nao foi possivel remover. Verifique se ha anuncios usando esta categoria.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-berry)]">
          <Tag className="h-4 w-4" aria-hidden />
          Catalogo
        </span>
        <h1 className="mt-1 text-3xl font-bold">Categorias</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-texto-suave)]">
          Organize os anuncios sem cards esticados demais. Cada categoria vira um filtro publico.
        </p>
      </div>

      {msg && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</p>}
      {erro && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{erro}</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(18rem,24rem)_1fr]">
        <Cartao destaque>
          <div className="mb-4 flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-[var(--color-sage)]" aria-hidden />
            <h2 className="text-lg font-bold">Nova categoria</h2>
          </div>
          <div className="grid gap-3">
            <CampoTexto
              rotulo="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Penteados"
            />
            <Botao type="button" onClick={criar} className="w-full">
              <Plus className="h-4 w-4" aria-hidden />
              Criar
            </Botao>
          </div>
        </Cartao>

        <div className="grid content-start gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {categorias.map((categoria) => (
            <Cartao key={categoria.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="block truncate font-black">{categoria.nome}</span>
                <span className="mt-1 block truncate text-xs font-semibold text-[var(--color-texto-suave)]">
                  /{categoria.slug}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remover(categoria.id)}
                className="tooltip-action inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700"
                aria-label="Remover categoria"
                data-tooltip="Remover categoria"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </Cartao>
          ))}
        </div>
      </div>
    </div>
  );
}
