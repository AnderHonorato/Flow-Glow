import { Cabecalho, Rodape } from "@/components/layout";

export default function PaginaTermos() {
  return (
    <>
      <Cabecalho />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold mb-8">Termos de Uso</h1>

        <div className="prose prose-stone max-w-none space-y-6 text-[var(--color-texto)]/80 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">1. Aceitação</h2>
            <p>
              Ao se cadastrar na plataforma Flow & Glow, você concorda integralmente com estes
              Termos de Uso. Caso não concorde, não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">2. Cadastro</h2>
            <p>
              Para acessar os tutoriais, você precisa criar uma conta fornecendo informações
              verdadeiras e atualizadas. Você é responsável por manter a confidencialidade de
              sua senha e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">3. Compra e Acesso</h2>
            <p>
              A compra de um tutorial garante acesso vitalício ao conteúdo. O acesso é pessoal
              e intransferível — o compartilhamento de login, download não autorizado ou
              redistribuição do conteúdo é proibido e pode resultar no bloqueio da conta.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">4. Reembolso</h2>
            <p>
              Oferecemos garantia de 7 dias após a compra, conforme o Código de Defesa do
              Consumidor (art. 49). Se você não ficar satisfeita com o tutorial, solicite o
              reembolso em até 7 dias pelo e-mail contato@studioglow.com.br e devolveremos
              100% do valor pago.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">5. Comportamento</h2>
            <p>
              É proibido publicar comentários ofensivos, discriminatórios, spam ou qualquer
              conteúdo ilegal na plataforma. Reservamo-nos o direito de remover conteúdo e
              bloquear contas que violem estas regras.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-[var(--color-texto)] mb-3">6. Direitos Autorais</h2>
            <p>
              Todo o conteúdo dos tutoriais (vídeos, textos, imagens) é protegido por direitos
              autorais e pertence à Flow & Glow ou aos instrutores parceiros. É proibida a
              reprodução, distribuição ou uso comercial sem autorização expressa.
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
