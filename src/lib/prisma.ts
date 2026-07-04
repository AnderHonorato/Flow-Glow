import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton do Prisma Client — evita criar múltiplas conexões
// durante o hot reload do Next.js em desenvolvimento.
// A conexão com o banco é criada de forma preguiçosa (lazy) porque
// a URL do banco pode não estar disponível em tempo de build.
const globalParaPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function criarPrismaClient(): PrismaClient {
  const urlBanco = process.env.DATABASE_URL;

  if (!urlBanco) {
    // Em tempo de build do Next.js, a URL pode não estar definida.
    // Retornamos um proxy que só falha quando uma consulta real é feita.
    console.warn(
      "⚠ DATABASE_URL não definida. O Prisma Client foi criado sem conexão com o banco."
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: urlBanco || "postgresql://localhost:5432/placeholder",
    }),
  });
}

export const prisma = globalParaPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
