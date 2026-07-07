"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao } from "@/components/ui";
import { Pause, Play, Trash2, UserCheck, ShieldCheck, ShieldOff, Download } from "lucide-react";
import { exportarCSV, exportarTXT } from "@/lib/exportar";

export default function PaginaAdminUsuarios() {
  const { accessToken } = useAutenticacao();
  const [usuarios, setUsuarios] = useState<{
    id: string; nomeCompleto: string; email: string; cpf: string | null;
    papel: string; emailVerificado: boolean; contaPausada: boolean; criadoEm: string;
  }[]>([]);

  async function carregar() {
    const r = await fetch("/api/admin/usuarios", { credentials: "include" });
    const d = await r.json();
    if (d.sucesso) setUsuarios(d.dados);
  }
  useEffect(() => { carregar(); }, [accessToken]);

  async function atualizar(id: string, dados: Record<string, unknown>) {
    await fetch("/api/admin/usuarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...dados }),
      credentials: "include",
    });
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir permanentemente este usuário?")) return;
    await fetch(`/api/admin/usuarios?id=${id}`, { method: "DELETE", credentials: "include" });
    carregar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Usuários</h1>
        <div className="flex gap-2">
          <Botao tamanho="pequeno" variante="contorno" onClick={() => {
            exportarCSV(
              ["Nome", "Email", "CPF", "Papel", "Verificado", "Pausada", "Cadastro"],
              usuarios.map(u => [u.nomeCompleto, u.email, u.cpf || "", u.papel, u.emailVerificado ? "Sim" : "Nao", u.contaPausada ? "Sim" : "Nao", new Date(u.criadoEm).toLocaleDateString("pt-BR")]),
              "usuarios"
            );
          }}>
            <Download className="h-4 w-4" /> CSV
          </Botao>
          <Botao tamanho="pequeno" variante="contorno" onClick={() => {
            const txt = usuarios.map(u =>
              `Nome: ${u.nomeCompleto}\nEmail: ${u.email}\nCPF: ${u.cpf || "N/A"}\nPapel: ${u.papel}\nVerificado: ${u.emailVerificado ? "Sim" : "Nao"}\nPausada: ${u.contaPausada ? "Sim" : "Nao"}\nCadastro: ${new Date(u.criadoEm).toLocaleDateString("pt-BR")}\n---`
            ).join("\n");
            exportarTXT(txt, "usuarios");
          }}>
            <Download className="h-4 w-4" /> TXT
          </Botao>
        </div>
      </div>
      <div className="space-y-3">
        {usuarios.map(u => (
          <Cartao key={u.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{u.nomeCompleto}</h3>
                <p className="text-sm text-[var(--color-texto-suave)]">{u.email}</p>
                {u.cpf && <p className="text-xs text-[var(--color-texto-suave)]/60">CPF: {u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${u.papel === "ADMINISTRADOR" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                  {u.papel === "ADMINISTRADOR" ? "Admin" : "Cliente"}
                </span>
                {u.contaPausada && <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 px-2 py-1 rounded-full font-semibold">Pausada</span>}
                {!u.emailVerificado && <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 px-2 py-1 rounded-full font-semibold">Não verificado</span>}

                {!u.emailVerificado && (
                  <button onClick={() => atualizar(u.id, { emailVerificado: true })} className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/30" title="Verificar e-mail">
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </button>
                )}
                {u.papel !== "ADMINISTRADOR" ? (
                  <>
                    <button onClick={() => atualizar(u.id, { papel: "ADMINISTRADOR" })} className="p-1.5 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30" title="Promover a administrador">
                      <ShieldCheck className="h-4 w-4 text-purple-600" />
                    </button>
                    <button onClick={() => atualizar(u.id, { contaPausada: !u.contaPausada })} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title={u.contaPausada ? "Reativar" : "Pausar"}>
                      {u.contaPausada ? <Play className="h-4 w-4 text-green-600" /> : <Pause className="h-4 w-4 text-yellow-600" />}
                    </button>
                    <button onClick={() => excluir(u.id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30" title="Excluir">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => atualizar(u.id, { papel: "CLIENTE" })} className="p-1.5 rounded hover:bg-orange-50 dark:hover:bg-orange-900/30" title="Rebaixar para cliente">
                    <ShieldOff className="h-4 w-4 text-orange-600" />
                  </button>
                )}
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
