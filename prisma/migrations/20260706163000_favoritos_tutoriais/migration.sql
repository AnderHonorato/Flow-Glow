CREATE TABLE IF NOT EXISTS "favoritos_tutoriais" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tutorialId" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "favoritos_tutoriais_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "favoritos_tutoriais_usuarioId_tutorialId_key"
  ON "favoritos_tutoriais"("usuarioId", "tutorialId");

CREATE INDEX IF NOT EXISTS "favoritos_tutoriais_tutorialId_idx"
  ON "favoritos_tutoriais"("tutorialId");

DO $$ BEGIN
  ALTER TABLE "favoritos_tutoriais"
    ADD CONSTRAINT "favoritos_tutoriais_usuarioId_fkey"
    FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "favoritos_tutoriais"
    ADD CONSTRAINT "favoritos_tutoriais_tutorialId_fkey"
    FOREIGN KEY ("tutorialId") REFERENCES "tutoriais"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
