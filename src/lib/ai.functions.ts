import { createServerFn } from "@tanstack/react-start";
import { ChatInput } from "./ai.schema";

export const nexusChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Nexus, a calm and precise AI operating system for knowledge work. Be concise, structured and practical.\n\nFormatting: reply in Markdown. Never answer with one long unbroken paragraph — break content into short paragraphs with blank lines between them. Use bullet or numbered lists, short headings, bold emphasis and fenced code blocks only when they genuinely help the answer; for a short simple answer just reply with one or two short sentences.",
          },
          ...data.messages,
        ],
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 429) throw new Error("Rate limited by the AI provider. Try again shortly.");
      if (response.status === 402) throw new Error("The AI provider reports no remaining credits.");
      throw new Error(`AI request failed (${response.status}): ${detail.slice(0, 300)}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("The AI returned an empty response.");

    return { text };
  });
