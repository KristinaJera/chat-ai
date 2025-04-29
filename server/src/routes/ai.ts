import { Router } from "express";
// import fetch from "node-fetch";   

// helper: fake translate until you wire real model
const mockTranslate = (t: string) => `EN: ${t}`;

export default Router()
  .post("/translate", (req, res) => {
    const { text, target } = req.body;
    res.json({ translated: mockTranslate(text) });
  })
  .post("/lookup-word", async (req, res) => {
    const { word } = req.body;
    const wiki = `Fake wiki snippet for ${word}`;
    const dict = `Fake dictionary entry for ${word}`;
    res.json({ wiki, dict });
  })
  .post("/rewrite", async (req, res) => {
    const { draft } = req.body;
    // ---- local LLM via Ollama (change prompt later)
    const resp = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      body: JSON.stringify({
        model: "mistral",
        prompt: `Rewrite professionally:\n\n${draft}`,
        stream: false,
      }),
    }).then((r) => r.json());

    res.json({ professional: resp.response.trim() });
  });
