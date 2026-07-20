import { ILLMProvider } from './ILLMProvider.js';

export class GenericAPIProvider implements ILLMProvider {
  constructor(
    private apiUrl: string,
    private modelName: string,
    private apiKey?: string,
    private inputField = 'prompt'
  ) {}

  async generateResponse(prompt: string): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {headers.Authorization = `Bearer ${this.apiKey}`;}

    const inputContent =
      this.inputField === 'messages'
        ? [{ role: 'user', content: prompt }]
        : prompt;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.modelName,
        [this.inputField]: inputContent,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro API LLM: ${response.status}`);
    }

    const data = await response.json();

    return (
      data.choices?.[0]?.message?.content ||
      data.response ||
      data.output ||
      data.generated_text ||
      '[]'
    );
  }
}