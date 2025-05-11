// const AI_BASE = `${import.meta.env.VITE_API_URL}/api/ai`;

// export const rewrite = (
//   draft: string
// ): Promise<{ suggestions: string[] }> =>
//   fetch(`${AI_BASE}/rewrite`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ text: draft }),
//   }).then((r) => r.json());

// export const translate = (
//   text: string,
//   target: string
// ): Promise<{ translated: string }> =>
//   fetch(`${AI_BASE}/translate`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ text, target }),
//   }).then((r) => r.json());


// src/api/ai.ts
import client from './client';

export interface RewriteResult {
  suggestions: string[];
}

export interface TranslateResult {
  translated: string;
}

export function rewrite(draft: string): Promise<RewriteResult> {
  return client
    .post<RewriteResult>('/api/ai/rewrite', { text: draft })
    .then(r => r.data);
}

export function translate(text: string, target: string): Promise<TranslateResult> {
  return client
    .post<TranslateResult>('/api/ai/translate', { text, target })
    .then(r => r.data);
}
