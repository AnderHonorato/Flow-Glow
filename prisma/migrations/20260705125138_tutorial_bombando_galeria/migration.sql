-- AlterTable
ALTER TABLE "tutoriais" ADD COLUMN     "bombando" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fotosGaleria" TEXT[] DEFAULT ARRAY[]::TEXT[];
