import { Router, Request, Response } from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/rewrite", async (req: Request, res: Response) => {
  const userText = req.body.text || "";

  const prompt =
    `Please rewrite the following text in a professional, polished tone, ` +
    `correcting grammar, improving clarity, and using elevated vocabulary. ` +
    `Preserve the original meaning.\n\nText: "${userText}"`;

  try {
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      n: 3,
      temperature: 0.7,
      max_tokens: 200,
    });

    const choices = apiResponse.choices || [];
    const rewrites = choices.map(
      (choice) => choice.message?.content?.trim() || ""
    );

    res.json({ suggestions: rewrites });
  } catch (error) {
    console.error("OpenAI rewrite error:", error);
    const fallback = [
      userText,
      `${userText} (alternative wording)`,
      `${userText} (another rephrasing)`,
    ];
    res.json({ suggestions: fallback });
  }
});

router.post("/translate", (req: Request, res: Response) => {
  const { text, target } = req.body as { text: string; target: string };
  const translated = `EN (${target}): ${text}`;
  res.json({ translated });
});

// router.post("/lookup-word", (req: Request, res: Response) => {
//   const { word } = req.body as { word: string };
//   const wiki = `Example Wikipedia snippet about "${word}".`;
//   const dict = `Definition of "${word}" from dictionary.`;
//   res.json({ wiki, dict });
// });

export default router;
