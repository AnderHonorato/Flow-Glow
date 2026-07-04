import { NextRequest, NextResponse } from "next/server";
import type { RespostaApi } from "@/tipos";

// Proxy reverso para a ViaCEP — evita problemas de CORS e mantém
// a chave (inexistente, a API é pública) fora do frontend.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cep: string }> }
): Promise<NextResponse<RespostaApi>> {
  try {
    const { cep } = await params;

    if (!/^\d{8}$/.test(cep)) {
      return NextResponse.json(
        { sucesso: false, erro: "CEP inválido. Use 8 dígitos numéricos." },
        { status: 400 }
      );
    }

    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!resposta.ok) {
      return NextResponse.json(
        { sucesso: false, erro: "Erro ao consultar o CEP." },
        { status: 502 }
      );
    }

    const dados = await resposta.json();

    if (dados.erro) {
      return NextResponse.json(
        { sucesso: false, erro: "CEP não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sucesso: true,
      dados: {
        cep: dados.cep.replace("-", ""),
        logradouro: dados.logradouro,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf,
      },
    });
  } catch {
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao consultar o serviço de CEP." },
      { status: 500 }
    );
  }
}
