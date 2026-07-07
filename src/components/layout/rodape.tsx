import { Mail, MessageCircle, ShieldCheck, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Marca } from "@/components/ui";

const NUMERO_WHATSAPP = "5511999999999";

export function Rodape() {
  return (
    <footer
      className="relative mt-auto overflow-hidden rounded-t-[1.5rem] border-t border-white/10 text-white sm:rounded-t-[3rem]"
      style={{
        background:
          "linear-gradient(rgba(23,32,51,0.88), rgba(23,32,51,0.88)), url(/logo-cat.jpg)",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 sm:py-10 sm:text-left lg:px-8">
        <div className="grid grid-cols-2 gap-5 sm:gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-2 flex items-center justify-center gap-2 sm:mb-3 sm:justify-start">
              <Marca inversa />
            </div>
            <p className="mx-auto max-w-sm text-xs leading-relaxed text-white/62 sm:mx-0 sm:text-sm">
              Anuncios de beleza, tutoriais e atendimentos selecionados para comprar,
              testar e acompanhar em uma experiencia simples.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40 sm:mb-3 sm:text-xs">
              Comprar
            </h4>
            <ul className="space-y-1.5 text-sm sm:space-y-2">
              <li>
                <Link
                  href="/tutoriais"
                  className="inline-flex items-center justify-center gap-2 text-white/72 hover:text-white sm:justify-start"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden />
                  Anuncios
                </Link>
              </li>
              <li>
                <Link href="/tutoriais?promocao=true" className="text-white/72 hover:text-white">
                  Promocoes
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
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40 sm:mb-3 sm:text-xs">
              Conta
            </h4>
            <ul className="space-y-1.5 text-sm sm:space-y-2">
              <li>
                <Link href="/meus-tutoriais" className="text-white/72 hover:text-white">
                  Meus tutoriais
                </Link>
              </li>
              <li>
                <Link href="/favoritos" className="text-white/72 hover:text-white">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="text-white/72 hover:text-white">
                  Perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/painel"
                  className="inline-flex items-center justify-center gap-2 text-white/72 hover:text-white sm:justify-start"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-white/40 sm:mb-3 sm:text-xs">
              Ajuda
            </h4>
            <div className="grid grid-cols-2 justify-items-center gap-1.5 text-sm sm:block sm:space-y-2 sm:text-left">
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
                E-mail
              </a>
              <Link href="/termos-de-uso" className="col-span-2 block text-white/72 hover:text-white sm:col-span-1">
                Termos e privacidade
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/42 sm:mt-8 sm:pt-6 sm:text-sm">
          © {new Date().getFullYear()} Flow & Glow. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
