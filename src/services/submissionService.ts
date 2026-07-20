import { prisma } from '../lib/prisma.js';

/**
 * Obtem todas as submissões associadas a uma tarefa específica, ordenadas por data de criação (mais recentes primeiro).
 * @param id_tarefa - O ID da tarefa.
 * @return Lista de submissões associadas à tarefa.
*/
export const getSubmissionsByTask = async (id_tarefa: number) => {
  return prisma.ficheiroSubmetido.findMany({
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
/**
 * Obtem os detalhes de uma submissão específica por ID.
 * @param id_ficheiro - O ID da submissão (ficheiro submetido).
 * @return Submissão ou null se nao existir.
*/
export const getSubmissionById = async (id_tarefa: number, id_ficheiro: number) => {
  return prisma.ficheiroSubmetido.findFirst({
    where: {
      id_tarefa,
      id_ficheiro,
    },
    include: {
      utilizador: true,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * Cria uma nova submissão para uma tarefa.
 * @param id_user - O ID do utilizador que fez a submissão.
 * @param nome - O nome da submissão.
 * @param id_tarefa - O ID da tarefa associada à submissão.
 * @param nome_ficheiro - O nome do ficheiro submetido.
 * @param file_path - O caminho do ficheiro no servidor.
 * @param mensagem_commit - Mensagem opcional de commit associada à submissão.
 * @return A submissão criada.
*/
export const createSubmission = async (
  id_user: number,
  nome: string,
  id_tarefa: number,
  nome_ficheiro: string,
  file_path: string,
  mensagem_commit?: string
) => {
  return prisma.ficheiroSubmetido.create({
    data: {
      id_user,
      nome,
      id_tarefa,
      nome_ficheiro,
      file_path,
      mensagem_commit,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/**
 * Remove uma submissão pelo ID.
 * @param id_ficheiro - O ID da submissão a remover.
 * @return A submissão eliminada.
*/
export const deleteSubmission = async (id_tarefa: number, id_ficheiro: number) => {
  const submission = await prisma.ficheiroSubmetido.findFirst({
    where: {
      id_tarefa,
      id_ficheiro,
    },
  });

  if (!submission) {
    throw new Error('Submissão não encontrada');
  }

  return prisma.ficheiroSubmetido.delete({
    where: { id_ficheiro },
  });
};