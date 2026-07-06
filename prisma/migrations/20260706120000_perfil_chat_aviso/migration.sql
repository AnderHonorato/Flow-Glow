-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ConversaStatus" AS ENUM ('TRIAGEM', 'AGUARDANDO_ATENDENTE', 'EM_ATENDIMENTO', 'ENCERRADA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "TipoMensagem" AS ENUM ('CLIENTE', 'ATENDENTE', 'BOT', 'SISTEMA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Drift already present in the remote database, kept here so migration history matches schema.
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "contaPausada" BOOLEAN NOT NULL DEFAULT false;
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_cpf_key" ON "usuarios"("cpf");
ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "comprovanteUrl" TEXT;

-- Perfil marketplace.
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "telefone" TEXT;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "dataNascimento" TIMESTAMP(3);
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "genero" TEXT;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "apelido" TEXT;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "profissao" TEXT;

-- Atendimento por protocolo.
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "protocolo" TEXT;
UPDATE "conversas"
SET "protocolo" = 'MCA-' || to_char(COALESCE("criadoEm", CURRENT_TIMESTAMP), 'YYYYMMDD') || '-' || upper(substr(md5("id"), 1, 6))
WHERE "protocolo" IS NULL;
ALTER TABLE "conversas" ALTER COLUMN "protocolo" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "conversas_protocolo_key" ON "conversas"("protocolo");

ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "status" "ConversaStatus" NOT NULL DEFAULT 'TRIAGEM';
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "assunto" TEXT;
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "atendenteId" TEXT;
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "clienteAguardandoDesde" TIMESTAMP(3);
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "atendimentoIniciadoEm" TIMESTAMP(3);
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "ultimaInteracaoClienteEm" TIMESTAMP(3);
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "avisoInatividadeEm" TIMESTAMP(3);
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "encerradoEm" TIMESTAMP(3);
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "encerradoPor" TEXT;
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "avaliacaoNota" INTEGER;
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "avaliacaoTexto" TEXT;
ALTER TABLE "conversas" ADD COLUMN IF NOT EXISTS "avaliacaoEnviadaEm" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "conversas_usuarioId_idx" ON "conversas"("usuarioId");
CREATE INDEX IF NOT EXISTS "conversas_atendenteId_idx" ON "conversas"("atendenteId");
CREATE INDEX IF NOT EXISTS "conversas_status_idx" ON "conversas"("status");

DO $$ BEGIN
  ALTER TABLE "conversas" ADD CONSTRAINT "conversas_atendenteId_fkey" FOREIGN KEY ("atendenteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "mensagens" ADD COLUMN IF NOT EXISTS "tipo" "TipoMensagem" NOT NULL DEFAULT 'CLIENTE';
ALTER TABLE "mensagens" DROP CONSTRAINT IF EXISTS "mensagens_remetenteId_fkey";
ALTER TABLE "mensagens" ALTER COLUMN "remetenteId" DROP NOT NULL;
CREATE INDEX IF NOT EXISTS "mensagens_remetenteId_idx" ON "mensagens"("remetenteId");
DO $$ BEGIN
  ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Faixa superior configuravel.
CREATE TABLE IF NOT EXISTS "configuracoes_aviso_topo" (
  "id" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensagem" TEXT NOT NULL,
  "linkTexto" TEXT,
  "linkUrl" TEXT,
  "corFundo" TEXT NOT NULL DEFAULT '#b9923d',
  "corTexto" TEXT NOT NULL DEFAULT '#ffffff',
  "ativo" BOOLEAN NOT NULL DEFAULT false,
  "inicioEm" TIMESTAMP(3) NOT NULL,
  "fimEm" TIMESTAMP(3) NOT NULL,
  "desativadoEm" TIMESTAMP(3),
  "desativadoMotivo" TEXT,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "configuracoes_aviso_topo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "configuracoes_aviso_topo_ativo_inicioEm_fimEm_idx" ON "configuracoes_aviso_topo"("ativo", "inicioEm", "fimEm");
