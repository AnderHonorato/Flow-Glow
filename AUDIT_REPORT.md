# Relatório de Auditoria — Flow & Glow (Vendas Online)

Auditoria completa do repositório Next.js 16 + TypeScript + Prisma 7.
Realizada em modo autônomo; correções de baixo risco aplicadas diretamente no código.

**Estado final após correções:** `tsc --noEmit` 0 erros · `next build` sucesso · `eslint` 0 erros (24 warnings remanescentes categorizados abaixo).

---

## 1. Resumo executivo

| Métrica | Antes | Depois |
|---|---|---|
| Erros TypeScript | 0 | 0 |
| Erros ESLint | 1 | 0 |
| Warnings ESLint | 42 | 24 |
| Build | OK | OK |
| Testes E2E | — | Sem testes (pasta `tests/` vazia) |
| Arquivos tracked indevidamente | 4 | 0 |

---

## 2. Corrigido automaticamente (aplicado no código)

### 2.1 Versionamento / limpeza do repositório
- **`Vendas Online.zip` removido do git** (`git rm`). Continha um snapshot completo do projeto **incluindo o `.env` com credenciais reais** (senha do Neon DB e chave da API DeepSeek). Já estava listado no `.gitignore` mas permanecia tracked.
- **`output/playwright/dev-server-*.log` removidos do git** — artefatos de teste logados indevidamente.
- **`src/app/favicon.ico2` removido do git** — arquivo duplicado/with nome inválido.
- **`.gitignore` atualizado**: adicionado `/test-results` e `/playwright-report`.

### 2.2 Lint / código morto
- **Erro ESLint `as any`** corrigido em `src/app/api/pedidos/problema/route.ts:99` — substituído o `include` Prisma manual duplicado por `includeConversaChat` reutilizado de `@/lib/chat`, eliminando o cast inseguro.
- **Imports não usados removidos**:
  - `meus-tutoriais/[slug]/page.tsx` — `Cartao`
  - `admin/tutoriais/page.tsx` — `ImagePlus`
  - `admin/usuarios/page.tsx` — `useCallback`, `UserX`
  - `components/ui/upload-imagem.tsx` — `ImageIcon`, `Trash2`, `CampoTexto`, `Cartao`
  - `components/layout/cabecalho.tsx` — `localizacao`, `solicitarLocalizacao` (destructures não usadas)
- **Prop não usada removida**: `usuario` em `SeloConteudo` (`barra-localizacao.tsx`) + call sites ajustados.
- **`eslint.config.mjs`**: adicionado `argsIgnorePattern: "^_"` e `varsIgnorePattern: "^_"` — silencia corretamente parâmetros prefixados com `_` (convenção de intencionalmente não usados), eliminando warnings em `logout`, `autenticacao`, `pagamento`.

### 2.3 Validação / segurança (correções objetivas)
- **`/api/comentarios`**: `tutorialId` agora é validado pelo schema Zod (`esquemaComentario` em `validacao.ts`) e lido de `validacao.data` em vez do `corpo` cru — antes o `tutorialId` passava sem validação nenhuma.
- **`/api/admin/usuarios` PUT**: `novoPapel` agora validado contra o enum (`CLIENTE` | `ADMINISTRADOR`) — antes aceitava qualquer string.
- **`/api/usuarios/perfil` PUT**: a mensagem de erro ao trocar e-mail **parou de revelar o código hardcoded "123456"**.

### 2.4 Bug de CSS (dark mode)
- **`globals.css:100`**: seletor `:root[data-theme="escuro"] html` era impossível (`html` não pode ser descendente de `html`), então o background do tema escuro **nunca era aplicado**. Corrigido para `:root[data-theme="escuro"]`.

### 2.5 Confiabilidade (timeouts em fetch externos)
- **`alphabot.ts`**: `fetch` para a API DeepSeek agora tem `AbortSignal.timeout(15000)` — antes podia hang indefinidamente se a API não respondesse, bloqueando o chat.
- **`api/cep/[cep]/route.ts`**: `fetch` para ViaCEP agora tem `AbortSignal.timeout(8000)`.

### 2.6 Texto / português (acentos e padronização)
- ~40 strings sem acento corrigidas em 14 arquivos: mensagens de erro de API (`cadastro`, `login`, `upload`, `usuarios/perfil`, `anuncios`, `admin/aviso-topo`, `admin/chat`), textos do AlphaBot (`alphabot.ts` — prompt e respostas), e UI (`autenticacao.tsx`, `preferencias.tsx`, `use-favoritos.tsx`).
- O prompt do AlphaBot mencionava **"Metrys IA do Anderson Honorato"** (nome do desenvolvedor vazando para o prompt da IA) — removido; padronizado para "Flow & Glow".

---

## 3. Pontos que precisam de decisão humana (não corrigidos)

### 3.1 Segurança — CRÍTICO

| # | Problema | Local | Solução proposta |
|---|---|---|---|
| S1 | **Segredos vazados no histórico do git.** O `.env` com a senha real do Neon DB (`npg_kDso9OLW5Uyp…`) e a chave da API DeepSeek (`sk-3f1c…`) estavam dentro do `Vendas Online.zip` commitado. O zip foi removido do tracking, mas **os segredos permanecem no histórico**. | histórico git | **Rotacionar imediatamente** a senha do Neon e a chave DeepSeek. Opcionalmente purgar o histórico com `git filter-repo` ou BFG. |
| S2 | **`/api/upload` é público** (listado em `prefixosEstaticos` no `proxy.ts`). Qualquer pessoa envia arquivos sem auth. Retorna **base64 data URLs** (incha o DB se armazenado). | `proxy.ts:33`, `api/upload/route.ts` | Remover `/api/upload` de `prefixosEstaticos` **e** adicionar header `Authorization: Bearer ${accessToken}` nos 3 fetch sites (`upload-imagem.tsx:35`, `chat-flutuante.tsx:400`, `admin/chat/[id]/page.tsx:104`). Mudança coordenada de médio risco. |
| S3 | **Webhook de pagamento sem validação de assinatura.** `/api/webhooks/pagamento` aceita qualquer POST (placeholder). | `api/webhooks/pagamento/route.ts` | Validar assinatura HMAC do Mercado Pago antes de confiar no payload. Crítico antes de ir a produção. |
| S4 | **Código hardcoded para troca de e-mail** `CODIGO_EMAIL_FICTICIO = "123456"` em `usuarios/perfil/route.ts:8`. Qualquer usuário logado muda de e-mail digitando "123456", e o endpoint ainda marca `emailVerificado: true` no e-mail novo sem verificar. | `api/usuarios/perfil/route.ts` | Implementar fluxo real de verificação por e-mail (enviar código/token real via Resend). |
| S5 | **Refresh tokens JWT stateless** sem revogação server-side. Token roubado é válido por 7 dias. | `lib/jwt.ts`, `api/auth/renovar-token` | Considerar denylist de refresh tokens ou reduzir TTL. Decisão de tradeoff de arquitetura. |

### 3.2 Banco de dados / schema (requer migração)

| # | Problema | Solução proposta |
|---|---|---|
| D1 | **`onDelete` ausente** em várias relações: `Pedido.usuario`, `Comentario.usuario`, `Mensagem.remetente`, `Conversa.usuario`, `Conversa.atendente`, `ItemPedido.tutorial`, `Tutorial.categoria`. O default (`Restrict`) força cascade manual no `perfil DELETE` e faz o `admin/usuarios DELETE` falhar com erro de FK para usuários com dados. | Definir `onDelete: Cascade` ou `SetNull` conforme regra de negócio em cada relação. Exige migração. |
| D2 | **Índices faltando**: `ItemPedido.tutorialId` (consulta "usuário já comprou?"), `Comentario.tutorialId` (listar por tutorial), `Tutorial.criadoEm` (ORDER BY frequente). | Adicionar `@@index` no `schema.prisma` + migração. |
| D3 | **`/api/admin/usuarios DELETE`** usa `prisma.usuario.delete` direto (sem cascade) — lança FK error para usuários com pedidos/conversas. Inconsistente com `/api/usuarios/perfil DELETE` que faz cascade manual em transação. | Reutilizar a lógica de cascade da rota `/perfil`, ou resolver via D1. |
| D4 | **`/api/redefinir-senha`** carrega TODOS os usuários com token não expirado e faz `bcrypt.compare` um a um — O(n), carrega `senhaHash` em memória. Não escala. | Indexar `tokenRecuperacaoHash` ou usar ID adicional no token para buscar direto. |

### 3.3 Arquitetura / performance

| # | Problema | Solução proposta |
|---|---|---|
| A1 | **Upload armazena base64 data URLs** em vez de enviar para R2/S3. O `.env` tem config de Cloudflare R2 mas não está implementado. Data URLs de vídeos (até 24 MB → ~32 MB base64) podem ser salvos no Postgres. | Implementar upload real para R2/S3 e guardar apenas a URL. |
| A2 | **Ordenação por avaliação quebrada** em `/api/tutoriais`: `ordenar=avaliacao` ordena apenas a página atual em memória — a página 2 pode ter itens com nota maior que a página 1. | Ordenação no DB (ex.: subquery de média) ou pré-cálculo de nota média em coluna. |
| A3 | **13 usos de `<img>`** em vez de `next/image` (admin, chat, avatar, carrossel, busca). Muitos usam data URLs ou URLs externas. | Configurar `remotePatterns` no `next.config.ts` para domínios externos (Unsplash, CDN). Para data URLs, avaliar loader customizado ou manter `<img>` com `loading="lazy"`. |
| A4 | **11 `useEffect` com dependência `carregar` ausente** (warnings `exhaustive-deps`). Padrão "carregar no mount" com `[]` intencional. | Envolver `carregar` em `useCallback` por componente (risco de stale closure/loop se feito sem cuidado). Avaliar caso a caso. |
| A5 | **`autenticacao.tsx`**: valor do contexto não memoizado (todo consumidor re-renderiza a cada render do provider); `salvarToken` salva em localStorage E sessionStorage ignorando o flag `persistir`; perfil buscado 2× na inicialização. | Memoizar valor com `useMemo`, corrigir lógica de `salvarToken`, remover busca duplicada. Refatoração de médio porte. |
| A6 | **`layout.tsx`**: script inline roda `MutationObserver` em todo o `document` para remover nós de extensão de navegador (ad-skipper). Custo de performance em cada mudança do DOM. | Remover o script — combater extensões do usuário é frágil e custoso. |
| A7 | **Home page (`page.tsx`) 100% client component** — busca dados no client. | Dividir em server component para SEO/perf inicial, mantendo interatividade em sub-componentes client. |
| A8 | **Inconsistência de marca**: "MCA Flow & Glow" (metadata, `chat.ts`), "Studio Glow" (`package.json`, `.env`, chave do carrinho `studioglow_carrinho`), "Flow & Glow" (padronizei o prompt do bot). | Definir um nome único e alinhar todos. |

### 3.4 Variáveis de ambiente
- `PROXIMA_PUBLIC_NOME_SITE` / `PROXIMA_PUBLIC_URL_SITE` no `.env` usam prefixo incorreto — deveria ser `NEXT_PUBLIC_*` para serem expostas ao client. Além disso **não são referenciadas em nenhum lugar do código**. Remover ou renomear e usar.
- `URL_PUBLICA` é usada em `lib/email.ts` e `tutoriais/[slug]/page.tsx` (server-side, correto).

### 3.5 Código morto / estrutura
- **Diretórios vazios** em `src/components/`: `avaliacao/`, `chat/`, `checkout/`, `perfil/`, `tutoriais/` (não tracked pelo git, mas clutter local).
- **`README.md`** é o boilerplate padrão do `create-next-app` — sem informação do projeto.
- **`tests/` vazio** — Playwright está configurado mas não há nenhum teste E2E.
- **`MODELO = "deepseek-v4-pro"`** em `alphabot.ts` — nome de modelo possivelmente inexistente; verificar na documentação DeepSeek (`deepseek-chat` / `deepseek-reasoner` são os conhecidos).

---

## 4. Notas metodológicas

- **AGENTS.md vs CLAUDE.md**: `CLAUDE.md` contém apenas `@AGENTS.md` (import). Sem conflitos. `AGENTS.md` alerta que Next.js 16 tem breaking changes — confirmado: o middleware foi renomeado para `proxy.ts` (em vez de `middleware.ts`), o que está correto no projeto.
- **Prisma 7** gera o client em `src/generated/prisma/` (corretamente no `.gitignore`).
- O `proxy.ts` sobrescreve headers `x-usuario-*` a cada request (seguro contra header injection de cliente).
- As rotas públicas de leitura (`/api/tutoriais`, `/api/categorias`, etc.) e o esquema de auth (access token + refresh token httpOnly) estão bem estruturados.

---

## 5. Próximos passos recomendados (prioridade)

1. **Rotacionar credenciais** vazadas (Neon DB + DeepSeek) — item S1.
2. **Proteger `/api/upload`** + adicionar headers de auth nos 3 fetch sites — item S2.
3. **Definir `onDelete` no schema** + criar migração — item D1 (resolve D3 também).
4. **Implementar upload para R2/S3** — item A1 (resolve parte de A3).
5. **Validar assinatura do webhook** antes de ir a produção — item S3.
6. **Definir a marca** e alinhar todos os textos/chaves — item A8.
7. **Escrever testes E2E** no `tests/` — atualmente não há cobertura.
