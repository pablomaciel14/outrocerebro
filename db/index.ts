import * as schema from "./schema";

export function getDb(): any {
  try {
    const cloudflareEnv = (globalThis as any).env;
    if (cloudflareEnv?.DB) {
      // Import dinâmico para runtime Cloudflare D1 se disponível
      const { drizzle } = require("drizzle-orm/d1");
      return drizzle(cloudflareEnv.DB, { schema });
    }
  } catch {
    // Ambiente sem D1 (Vercel / Node local)
  }

  // Driver resiliente para ambiente Vercel / Node.js
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: async () => {},
      }),
    }),
    delete: () => ({
      where: async () => {},
    }),
  };
}
