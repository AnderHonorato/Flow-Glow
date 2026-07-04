import { Cabecalho, Rodape } from "@/components/layout";

export default function PaginaPrivacidade() {
  return (
    <>
      <Cabecalho />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold mb-8">Política de Privacidade</h1>

        <div className="prose prose-stone max-w-none space-y-6 text-[var(--color-texto)]/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">1. Dados Coletados</h2>
            <p>
              A  Flow & Glow coleta os seguintes dados pessoais: nome completo, e-mail, número de WhatsApp
              (opcional), endereço de entrega (opcional) e dados de pagamento tokenizados.
              Nenhum dado de cartão de crédito completo é armazenado em nossos servidores
              — apenas tokens fornecidos pelo gateway de pagamento (Mercado Pago), os 4 últimos
              dígitos do cartão e a bandeira, conforme exigido pelo padrão PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">2. Finalidade</h2>
            <p>
              Seus dados são utilizados exclusivamente para: criar e gerenciar sua conta,
              processar pagamentos, liberar acesso aos tutoriais adquiridos, enviar comunicações
              essenciais sobre sua conta (verificação de e-mail, recuperação de senha) e,
              mediante seu consentimento, enviar novidades sobre novos tutoriais.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">3. Compartilhamento</h2>
            <p>
              Compartilhamos dados apenas com prestadores de serviço essenciais: Mercado Pago
              (processamento de pagamento), serviço de e-mail transacional (Resend ou similar),
              serviço de hospedagem (Render/PostgreSQL Neon) e armazenamento de arquivos
              (Cloudflare R2/S3). Todos seguem padrões rigorosos de segurança e conformidade.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">4. Retenção</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta,
              os dados são removidos em até 30 dias. Dados de pedidos e transações financeiras
              são mantidos pelo período exigido pela legislação fiscal brasileira (5 anos).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">5. Seus Direitos (LGPD)</h2>
            <p>
              Nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:
              confirmar a existência de tratamento de dados; acessar seus dados; corrigir dados
              incompletos ou desatualizados; solicitar a exclusão de dados desnecessários ou
              tratados em desconformidade; e revogar seu consentimento a qualquer momento.
              Para exercer esses direitos, entre em contato pelo e-mail abaixo.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">6. Contato</h2>
            <p>
              Dúvidas sobre o tratamento de dados pessoais? Entre em contato com nosso
              Encarregado de Dados (DPO):{" "}
              <strong className="text-[var(--color-texto)]">
                privacidade@studioglow.com.br
              </strong>
              . Responderemos sua solicitação em até 15 dias.
            </p>
          </section>

          <p className="text-sm text-[var(--color-texto)]/40 pt-4">
            Última atualização: julho de 2026.
          </p>
        </div>
      </main>
      <Rodape />
    </>
  );
}
