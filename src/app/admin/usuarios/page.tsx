"use client";

import { useState, useEffect } from "react";
import { useAutenticacao } from "@/contexto/autenticacao";
import { Cartao } from "@/components/ui";

export default function PaginaAdminUsuarios() {
  const { accessToken } = useAutenticacao();
  const [usuarios, setUsuarios] = useState<{id:string;nomeCompleto:string;email:string;papel:string;emailVerificado:boolean;criadoEm:string}[]>([]);
  useEffect(() => { fetch("/api/admin/usuarios", { headers: { Authorization: `Bearer ${accessToken}` } }).then(r => r.json()).then(d => { if (d.sucesso) setUsuarios(d.dados); }); }, [accessToken]);
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Usuários</h1>
      <div className="space-y-3">
        {usuarios.map((u) => (
          <Cartao key={u.id} className="flex items-center justify-between">
            <div><h3 className="font-medium">{u.nomeCompleto}</h3><p className="text-sm text-[var(--color-texto)]/50">{u.email}</p></div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${u.papel==="ADMINISTRADOR"?"bg-purple-100 text-purple-700":"bg-gray-100 text-gray-600"}`}>{u.papel}</span>
              {u.emailVerificado && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Verificado</span>}
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  );
}
