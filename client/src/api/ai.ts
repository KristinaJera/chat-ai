// src/api/ai.ts

export const rewrite = (
    draft: string
  ): Promise<{ professional: string }> =>
    fetch("http://localhost:3001/api/ai/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
    }).then((r) => r.json());
  
  export const translate = (
    text: string,
    target: string
  ): Promise<{ translated: string }> =>
    fetch("http://localhost:3001/api/ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target }),
    }).then((r) => r.json());
  
  export const lookupWord = (
    word: string
  ): Promise<{ wiki: string; dict: string }> =>
    fetch("http://localhost:3001/api/ai/lookup-word", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word }),
    }).then((r) => r.json());
  