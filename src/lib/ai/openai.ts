type TextMessage = { role: "system" | "user" | "assistant"; content: string };
type VisionMessage = {
  role: "user";
  content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" } }
  >;
};

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function openAiComplete(params: {
  model: string;
  messages: Array<TextMessage | VisionMessage>;
  maxTokens?: number;
}): Promise<{ text: string; tokensIn?: number; tokensOut?: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.maxTokens ?? 800,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("Empty response from OpenAI");

  return {
    text,
    tokensIn: json.usage?.prompt_tokens,
    tokensOut: json.usage?.completion_tokens,
  };
}
