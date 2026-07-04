import { Mail, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";

const NUMERO_WHATSAPP = "5511999999999";

export function Rodape() {
  return (
    <footer className="mt-auto border-t border-[var(--color-linha)] bg-[var(--color-texto)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-berry)] text-xs font-bold">
                SG
              </span>
              <h3 className="font-serif text-xl font-bold text-[var(--color-ouro-claro)]">
                Flow & Glow
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/62">
              Anúncios de beleza, tutoriais e atendimentos selecionados para comprar,
              testar e acompanhar em uma experiência simples.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              Comprar
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tutoriais" className="inline-flex items-center gap-2 text-white/72 hover:text-white">
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                  Anúncios
                </Link>
              </li>
              <li>
                <Link href="/tutoriais?promocao=true" className="text-white/72 hover:text-white">
                  Promoções
                </Link>
              </li>
              <li>
                <Link href="/carrinho" className="text-white/72 hover:text-white">
                  Carrinho
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              Conta
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/meus-tutoriais" className="text-white/72 hover:text-white">
                  Meus tutoriais
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="text-white/72 hover:text-white">
                  Perfil
                </Link>
              </li>
              <li>
                <Link href="/admin/painel" className="inline-flex items-center gap-2 text-white/72 hover:text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-white/40">
              Ajuda
            </h4>
            <div className="space-y-2 text-sm">
              <a
                href={`https://wa.me/${NUMERO_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/72 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
              <a
                href="mailto:contato@studioglow.com.br"
                className="flex items-center gap-2 text-white/72 hover:text-white"
              >
                <Mail className="h-4 w-4" aria-hidden />
                contato@studioglow.com.br
              </a>
              <Link href="/termos-de-uso" className="block text-white/72 hover:text-white">
                Termos e privacidade
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/42">
          © {new Date().getFullYear()} Flow & Glow. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
