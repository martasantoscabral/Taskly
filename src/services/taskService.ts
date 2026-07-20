import { prisma } from '../lib/prisma.js';


/* 
 *Tipo de dados para filtros na obter tarefas.
 * Permite filtrar por usuário, status e prioridade.
 * Todos os campos são opcionais
 */
type GetTasksFilters = {
  id_user?: number;
  status?: string;
  priority?: string;
  id_grupo?: number;
};

/**
 * Tipo de dados para criação de tarefa.
 * Dados obrigatórios: title, id_user
 * Dados opcionais: description, priority, status, dueDate
 */
type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status?: 'PENDING' | 'DOING' | 'DONE';
  dueDate?: Date;
  id_user: number;
  id_grupo?: number;
  subTasks?: {
    titulo: string;
    concluida?: boolean;
  }[];
};

/**
 * Tipo de dados para atualização de tarefa.
 * Atualizar qualquer campo da tarefa, menos o ID.
 */
type UpdateTaskInput = {
  title?: string;
  description?: string;
  priority?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status?: 'PENDING' | 'DOING' | 'DONE';
  dueDate?: Date;
  id_grupo?: number;
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Obtem todas as tarefas, com possibilidade de aplicar filtros por usuário, status e prioridade.
 * @param filters - Filtros opcionais para refinar a busca
 * @returns Lista de tarefas que correspondem aos filtros aplicados
*/


export const getTasks = async (filters?: GetTasksFilters) => {
  return prisma.task.findMany({
    where: {

      // utilizador
      ...(filters?.id_user !== undefined
        ? { id_user: filters.id_user }
        : {}),

      // grupo
      ...(filters?.id_grupo !== undefined
        ? { id_grupo: filters.id_grupo }
        : {}),

      // estado
      ...(filters?.status
        ? { status: filters.status as any }
        : {}),

      // prioridade
      ...(filters?.priority
        ? { priority: filters.priority as any }
        : {}),
    },

    include: {
      user: true,
      subTasks: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/* 
 * Obtem uma tarefa específica pelo seu ID
 * @param id - ID da tarefa a ser obtida
 * @returns Tarefa ou null se não existir
*/
export const getTaskById = async (id: number) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      user: true,
      subTasks: true,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Cria uma nova tarefa.
 */
export const createTask = async (data: CreateTaskInput) => {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
      id_user: data.id_user,
      subTasks: data.subTasks && data.subTasks.length > 0
              ? {create: data.subTasks.map((subTask) => ({
                    titulo: subTask.titulo,
                    concluida: subTask.concluida ?? false,
                  })),
                }
              : undefined,
      id_grupo: data.id_grupo || null,
    },
    include: {
      user: true,
      subTasks: true,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * Atualiza uma tarefa existente.
 * Permite atualizar qualquer campo da tarefa, exceto o ID.
 */
export const updateTask = async (id: number, data: UpdateTaskInput) => {
  return prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
    },
    include: {
      user: true,
      subTasks: true,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Remove uma tarefa.
 */
export const deleteTask = async (id: number) => {
  return prisma.task.delete({
    where: { id },
  });
};