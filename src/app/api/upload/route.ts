import { NextRequest, NextResponse } from "next/server";
import type { RespostaApi } from "@/tipos";

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const form = await request.formData();
    const arquivo = form.get("arquivo") as File | null;

    if (!arquivo) {
      return NextResponse.json({ sucesso: false, erro: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Valida tipo
    const permitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!permitidos.includes(arquivo.type)) {
      return NextResponse.json({ sucesso: false, erro: "Tipo de imagem não permitido." }, { status: 400 });
    }

    // Valida tamanho (máx 5MB)
    if (arquivo.size > 5 * 1024 * 1024) {
      return NextResponse.json({ sucesso: false, erro: "Imagem muito grande. Máximo 5MB." }, { status: 400 });
    }

    // Converte para base64 como storage simples (em produção usar S3/R2)
    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const url = `data:${arquivo.type};base64,${base64}`;

    return NextResponse.json({ sucesso: true, dados: { url } });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao processar upload." }, { status: 500 });
  }
}
