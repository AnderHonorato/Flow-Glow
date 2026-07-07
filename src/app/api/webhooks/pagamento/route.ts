import "server-only";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { esquemaWebhookPagamento } from "@/lib/validacao";
import type { RespostaApi } from "@/tipos";

function validarAssinatura(request: NextRequest, corpoBruto: string): boolean {
  const secret = process.env.WEBHOOK_SECRET_MERCADO_PAGO;
  if (!secret) return false;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature) return false;

  const partes = signature.split(",");
  let ts = "";
  let hash = "";
  for (const parte of partes) {
    const [chave, valor] = parte.split("=");
    if (chave === "ts") ts = valor;
    if (chave === "v1") hash = valor;
  }

  if (!ts || !hash) return false;

  const manifest = `id:${requestId || ""};request-body:${corpoBruto};ts:${ts};`;
  const esperado = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(esperado));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const corpoBruto = await request.text();

    if (!validarAssinatura(request, corpoBruto)) {
      return NextResponse.json(
        { sucesso: false, erro: "Assinatura inválida." },
        { status: 401 }
      );
    }

    const corpo = JSON.parse(corpoBruto);
    const validacao = esquemaWebhookPagamento.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json(
        { sucesso: false, erro: "Payload inválido." },
        { status: 400 }
      );
    }

    const { data, action, type } = validacao.data;
    const paymentId = String(data?.id || "");
    const evento = action || type || "";

    console.log("[WEBHOOK] Notificação válida:", { id: paymentId, acao: evento });

    if (!paymentId) {
      return NextResponse.json({ sucesso: true }, { status: 200 });
    }

    const idTransacaoGateway = `MP-${paymentId}`;

    const pedidoExistente = await prisma.pedido.findFirst({
      where: { idTransacaoGateway },
      select: { id: true, status: true },
    });

    if (pedidoExistente?.status === "APROVADO") {
      return NextResponse.json({ sucesso: true }, { status: 200 });
    }

    if (evento.includes("approved") || evento.includes("payment.approved")) {
      if (pedidoExistente) {
        await prisma.pedido.update({
          where: { id: pedidoExistente.id },
          data: { status: "APROVADO" },
        });
      }
    } else if (evento.includes("rejected") || evento.includes("payment.rejected")) {
      if (pedidoExistente) {
        await prisma.pedido.update({
          where: { id: pedidoExistente.id },
          data: { status: "RECUSADO" },
        });
      }
    }

    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (erro) {
    console.error("Erro no webhook de pagamento:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao processar webhook." },
      { status: 500 }
    );
  }
}
