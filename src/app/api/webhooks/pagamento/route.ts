import { NextRequest, NextResponse } from "next/server";
import type { RespostaApi } from "@/tipos";

// Webhook que recebe a confirmação de pagamento do gateway (Mercado Pago).
// Em produção, a assinatura do webhook DEVE ser validada antes de confiar na requisição.
export async function POST(request: NextRequest): Promise<NextResponse<RespostaApi>> {
  try {
    const corpo = await request.json();

    console.log("[WEBHOOK] Notificação recebida:", {
      id: corpo.data?.id || corpo.id,
      acao: corpo.action || corpo.type,
    });

    // Em produção:
    // 1. Validar assinatura do webhook com a chave secreta do Mercado Pago
    // 2. Buscar o pagamento pelo ID no Mercado Pago para confirmar o status
    // 3. Atualizar o pedido no banco de dados
    // 4. Liberar acesso ao tutorial para o comprador
    //
    // Exemplo de atualização:
    // const pedido = await prisma.pedido.update({
    //   where: { idTransacaoGateway: corpo.data.id },
    //   data: { status: "APROVADO" },
    // });

    return NextResponse.json({ sucesso: true }, { status: 200 });
  } catch (erro) {
    console.error("Erro no webhook de pagamento:", erro);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao processar webhook." },
      { status: 500 }
    );
  }
}
