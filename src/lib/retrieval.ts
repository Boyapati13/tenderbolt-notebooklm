import { prisma } from "@/lib/prisma";

export type RetrievedChunk = {
  docId: string;
  filename: string;
  text: string;
  score: number;
};

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreChunk(queryTokens: string[], chunkTokens: string[]): number {
  const set = new Set(chunkTokens);
  let overlap = 0;
  for (const t of queryTokens) if (set.has(t)) overlap++;
  return overlap / Math.max(1, chunkTokens.length);
}

function chunkText(text: string, maxLen = 700): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxLen) {
    chunks.push(words.slice(i, i + maxLen).join(" "));
  }
  return chunks;
}

export async function retrieveTopChunks(query: string, limit = 4): Promise<RetrievedChunk[]> {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, filename: true, text: true },
  });
  const qTokens = tokenize(query);
  const scored: RetrievedChunk[] = [];
  for (const d of docs) {
    const chunks = chunkText(d.text || "");
    for (const c of chunks) {
      const s = scoreChunk(qTokens, tokenize(c));
      if (s > 0) scored.push({ docId: d.id, filename: d.filename, text: c, score: s });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}


