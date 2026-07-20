import { prisma } from '../lib/prisma.js';


/*
 * Obtem todos os conflitos associados a uma tarefa
 * @param id_tarefa - ID da tarefa para a qual os conflitos devem ser listados
 * @returns Lista de conflitos associados à tarefa (mais recentes primeiro)
 */
export const getConflictsByTask = async (id_tarefa: number) => {
  return prisma.conflitoFicheiros.findMany({
    //filtra os conflitos pela tarefa
    where: { id_tarefa },

    //inclui os dados do utilizador associado a cada conflito
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
 * Obtem um conflito específico pelo ID
 * @param id_conflito - ID do conflito a ser obtido
 * @returns O conflito ou null se não encontrado
 */
export const getConflictById = async (id_conflito: number) => {
  return prisma.conflitoFicheiros.findUnique({
    where: { id_conflito },
    include: {
      utilizador: true,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Cria um novo conflito manualmente
 * @param id_tarefa - ID da tarefa associada ao conflito
 * @param nome_ficheiro - Nome do ficheiro em conflito
 * @param id_user - ID do utilizador que criou o conflito
 * @param mensagem_commit - Mensagem do commit associada ao conflito
 * @param status - Status inicial do conflito (ex: 'pendente')
 * @returns Conflito criado
 */
export const createConflict = async (
  id_tarefa: number,
  nome_ficheiro: string,
  id_user: number,
  mensagem_commit: string,
  status: string
) => {
  return prisma.conflitoFicheiros.create({
    data: {
      id_tarefa,
      nome_ficheiro,
      id_user,
      mensagem_commit,
      status,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Resolve um conflito existente
 * @param id_conflito - ID do conflito a ser resolvido
 * @param id_versao_escolhida - ID da versão escolhida para resolver o conflito (pode ser null)
 * @param status - Novo status do conflito (ex: 'resolvido')
 * @returns Conflito atualizado
 */
export const resolveConflict = async (
  id_conflito: number,
  id_versao_escolhida: number | null,
  status: string
) => {
  return prisma.conflitoFicheiros.update({
    where: { id_conflito },
    
    //atualiza a versao escolhida e o novo estado
    data: {
      id_versao_escolhida,
      status,
    },
  });
};