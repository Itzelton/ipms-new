import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenRouterService {
  private readonly apiKey = process.env.OPENROUTER_API_KEY ?? '';
  private readonly model = process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct';

  get configured(): boolean {
    return this.apiKey.length > 0;
  }

  async chat(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'IPMS AI Assistant',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 600,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${text}`);
    }

    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content as string | undefined;
    return content?.trim() ?? 'No response from the AI model.';
  }
}
