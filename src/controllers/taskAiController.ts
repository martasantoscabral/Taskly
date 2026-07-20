import { type Request, type Response } from 'express';
import * as taskAiService from '../services/taskAiService.js';
import { GenericAPIProvider } from '../services/ai/GenericAPIProvider.js';

export const suggestAndSaveSubtasksController = async (req: Request,res: Response) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    return res.status(400).json({
      error: 'ID da tarefa inválido.',
    });
  }


  console.log("URL:", process.env.LLM_API_URL);
  console.log("MODEL:", process.env.LLM_MODEL);

  try {
    const llm = new GenericAPIProvider(
      process.env.LLM_API_URL!,
      process.env.LLM_MODEL!,
      process.env.LLM_API_KEY
    );

    const taskWithSubtasks = await taskAiService.suggestAndSaveSubtasks(
      taskId,
      llm
    );

    return res.status(201).json(taskWithSubtasks);
  } catch (error) {
    console.error('Erro ao gerar subtarefas:', error);

    return res.status(500).json({
      error: 'Erro ao gerar e guardar subtarefas.',
    });
  }
};


export const suggestSubtasksController = async (req: Request,res: Response) => {
  try {
    const { title, description } = req.body;

    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({
        error: "Título é obrigatório.",
        bodyRecebido: req.body,
      });
    }

    const llm = new GenericAPIProvider(
      process.env.LLM_API_URL!,
      process.env.LLM_MODEL!,
      process.env.LLM_API_KEY
    );
    const subtasks = await taskAiService.suggestSubtasks(
      title,
      description,
      llm
    );

    return res.json({
      subTasks: subtasks,
    });
  } catch (error) {
    console.error("Erro ao gerar subtarefas:", error);

    return res.status(500).json({
      error: "Erro ao gerar subtarefas.",
    });
  }
};


