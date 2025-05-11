const AI_BASE = `${import.meta.env.VITE_API_URL}/api/ai`;

export const rewrite = (
  draft: string
): Promise<{ suggestions: string[] }> =>
  fetch(`${AI_BASE}/rewrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: draft }),
  }).then((r) => r.json());

export const translate = (
  text: string,
  target: string
): Promise<{ translated: string }> =>
  fetch(`${AI_BASE}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target }),
  }).then((r) => r.json());

