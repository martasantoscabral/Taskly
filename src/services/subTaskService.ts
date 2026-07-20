import { prisma } from '../lib/prisma.js';

export const getSubTasksByTask = async (id_tarefa: number) => {
  return prisma.subTask.findMany({
    where: { id_tarefa },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};

export const getSubTaskById = async (id_tarefa: number, id_subtask: number) => {
  return prisma.subTask.findFirst({
    where: {
      id_tarefa,
      id_subtask,
    },
  });
};

export const createSubTask = async (
  id_tarefa: number,
  titulo: string,
  concluida?: boolean
) => {
  return prisma.subTask.create({
    data: {
      id_tarefa,
      titulo,
      concluida: concluida ?? false,
    },
  });
};

export const updateSubTask = async (
  id_tarefa: number,
  id_subtask: number,
  dados: {
    titulo?: string;
    concluida?: boolean;
  }
) => {
  const subtask = await prisma.subTask.findFirst({
    where: {
      id_tarefa,
      id_subtask,
    },
  });

  if (!subtask) {
    throw new Error('SubTask não encontrada');
  }

  return prisma.subTask.update({
    where: { id_subtask },
    data: dados,
  });
};

export const deleteSubTask = async (id_tarefa: number, id_subtask: number) => {
  const subtask = await prisma.subTask.findFirst({
    where: {
      id_tarefa,
      id_subtask,
    },
  });

  if (!subtask) {
    throw new Error('SubTask não encontrada');
  }

  return prisma.subTask.delete({
    where: { id_subtask },
  });
};