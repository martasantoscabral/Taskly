import { ILLMProvider } from './ILLMProvider.js';

export class MockLLMProvider implements ILLMProvider {
  async generateResponse(prompt: string): Promise<string> {
    return JSON.stringify([
      'Definir objetivo da tarefa',
      'Dividir o trabalho em partes pequenas',
      'Pesquisar informação necessária',
      'Implementar a primeira versão',
      'Rever e corrigir erros',
      'Testar o resultado final',
    ]);
  }
}