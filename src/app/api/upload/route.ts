import { NextRequest, NextResponse } from "next/server";
import type { RespostaApi } from "@/tipos";

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const form = await request.formData();
    const arquivo = form.get("arquivo") as File | null;

    if (!arquivo) {
      return NextResponse.json({ sucesso: false, erro: "Nenhum arquivo enviado." }, { status: 400 });
    }

    const permitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!permitidos.includes(arquivo.type)) {
      return NextResponse.json({ sucesso: false, erro: "Tipo de arquivo não permitido." }, { status: 400 });
    }

    const limite = arquivo.type.startsWith("video/") ? 24 * 1024 * 1024 : 5 * 1024 * 1024;
    if (arquivo.size > limite) {
      return NextResponse.json({ sucesso: false, erro: "Arquivo muito grande para este ambiente." }, { status: 400 });
    }

    const bytes = await arquivo.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const url = `data:${arquivo.type};base64,${base64}`;

    return NextResponse.json({
      sucesso: true,
      dados: {
        url,
        tipo: arquivo.type.startsWith("video/") ? "VIDEO" : "IMAGEM",
      },
    });
  } catch {
    return NextResponse.json({ sucesso: false, erro: "Erro ao processar upload." }, { status: 500 });
  }
}
