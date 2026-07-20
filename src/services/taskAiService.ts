import { prisma } from '../lib/prisma.js';
import { ILLMProvider } from './ai/ILLMProvider.js';
import { MockLLMProvider } from "./ai/MockLLMProvider.js";
import { GenericAPIProvider } from "./ai/GenericAPIProvider.js";


export const suggestAndSaveSubtasks = async (taskId: number, llm: ILLMProvider) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  const prompt = `
Gera entre 5 a 7 subtarefas para esta tarefa.

Título: "${task.title}"
Descrição: "${task.description ?? 'Sem descrição'}"

Responde apenas em JSON válido:
["subtarefa 1", "subtarefa 2", "subtarefa 3"]
`;

  const response = await llm.generateResponse(prompt);

  const subtasks = JSON.parse(response);

  if (!Array.isArray(subtasks)) {
    throw new Error('Resposta inválida da LLM');
  }

  await prisma.subTask.createMany({
    data: subtasks.map((titulo: string) => ({
      titulo,
      id_tarefa: task.id,
    })),
  });

  return await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      subTasks: true,
    },
  });
};






export const suggestSubtasks = async (
  title: string,
  description: string | undefined,
  llm: ILLMProvider
) => {
  const prompt = `
Gera entre 5 a 7 subtarefas para esta tarefa.

Título: "${title}"
Descrição: "${description ?? "Sem descrição"}"

Responde apenas em JSON válido:
["subtarefa 1", "subtarefa 2", "subtarefa 3"]
`;

  const response = await llm.generateResponse(prompt);

  const subtasks = JSON.parse(response);

  if (!Array.isArray(subtasks)) {
    throw new Error("Resposta inválida da LLM");
  }

  return subtasks;
};