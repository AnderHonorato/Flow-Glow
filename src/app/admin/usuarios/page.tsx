"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao, Botao } from "@/components/ui";
import { Pause, Play, Trash2, UserCheck } from "lucide-react";

export default function PaginaAdminUsuarios() {
  const { accessToken } = useAutenticacao();
  const [usuarios, setUsuarios] = useState<{
    id: string; nomeCompleto: string; email: string; cpf: string | null;
    papel: string; emailVerificado: boolean; contaPausada: boolean; criadoEm: string;
  }[]>([]);

  async function carregar() {
    const r = await fetch("/api/admin/usuarios", { headers: { Authorization: `Bearer ${accessToken}` } });
    const d = await r.json();
    if (d.sucesso) setUsuarios(d.dados);
  }
  useEffect(() => { carregar(); }, [accessToken]);

  async function alternarPausa(id: string, pausar: boolean) {
    await fetch("/api/admin/usuarios", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ id, contaPausada: pausar }),
    });
    carregar();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir permanentemente este usuário?")) return;
    await fetch(`/api/admin/usuarios?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
    carregar();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Usuários</h1>
      <div className="space-y-3">
        {usuarios.map(u => (
          <Cartao key={u.id}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{u.nomeCompleto}</h3>
                <p className="text-sm text-[#715f55]">{u.email}</p>
                {u.cpf && <p className="text-xs text-[#715f55]/60">CPF: {u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>}
              </div>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full ${u.papel === "ADMINISTRADOR" ? "bg-purple-100 text-purple-700" : "bg-gray-100"}`}>{u.papel}</span>
                {u.contaPausada && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pausada</span>}
                {!u.emailVerificado && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Não verificado</span>}
                {u.papel !== "ADMINISTRADOR" && (
                  <>
                    <button onClick={() => alternarPausa(u.id, !u.contaPausada)} className="p-1.5 rounded hover:bg-gray-100" title={u.contaPausada ? "Reativar" : "Pausar"}>
                      {u.contaPausada ? <Play className="h-4 w-4 text-green-600" /> : <Pause className="h-4 w-4 text-yellow-600" />}
                    </button>
                    <button onClick={() => excluir(u.id)} className="p-1.5 rounded hover:bg-red-50" title="Excluir">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
