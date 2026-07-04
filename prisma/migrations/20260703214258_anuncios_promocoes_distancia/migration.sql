-- AlterTable
ALTER TABLE "tutoriais" ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "cupomDesconto" TEXT,
ADD COLUMN     "destaquePromocional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "distanciaKm" INTEGER,
ADD COLUMN     "estado" TEXT;
