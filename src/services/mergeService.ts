import { prisma } from '../lib/prisma.js';


/* 
 * Obtem o merge final mais recente de uma tarefa específica
 * @param id_tarefa - ID da tarefa 
 * @return Mrge final mais recente ou null se não existir
 */
export const getMergeByTask = async (id_tarefa: number) => {
  return prisma.mergeFicheiro.findFirst({
    //filtra pelo ID da tarefa
    where: { id_tarefa },

    //inclui os dados do utilizador que criou o merge
    include: {
      utilizador: true,
    },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Cria um merge final para uma tarefa específica
 * @param id_tarefa - ID da tarefa
 * @param criado_por - ID do utilizador que criou o merge
 * @param tamanho - Tamanho do merge 
 * @param ficheiros_incluidos - Lista de ficheiros incluídos no merge (ex: "file1.txt, file2.txt")
 * @return O merge criado
 */
export const createMerge = async (
  id_tarefa: number,
  criado_por: number,
  tamanho: string,
  ficheiros_incluidos: string
) => {
  return prisma.mergeFicheiro.create({
    data: {
      id_tarefa,
      criado_por,
      tamanho,
      ficheiros_incluidos,
    },
  });

};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Obtem todos os merges finais de uma tarefa específica
 * @param id_tarefa - ID da tarefa 
 * @return Lista de merges finais associados à tarefa, ordenados por data de criação (mais recente primeiro)
 */
export const getMergesByTask = async (id_tarefa: number) => {
  return prisma.mergeFicheiro.findMany({
    where: { id_tarefa },
    include: {
      utilizador: true,
    },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Obtem um merge final específico pelo seu ID
 * @param id_merge - ID do merge 
 * @return Merge final correspondente ao ID fornecido ou null se não existir
 */
export const getMergeById = async (id_merge: number) => {
  return prisma.mergeFicheiro.findUnique({
    where: { id_merge },
    include: {
      utilizador: true,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * Remove um merge pelo ID.
 * 
 * @param id_merge - ID do merge a eliminar
 * @returns Merge eliminado
 */
export const deleteMergeById = async (id_merge: number) => {
  return prisma.mergeFicheiro.delete({
    where: { id_merge },
  });
};