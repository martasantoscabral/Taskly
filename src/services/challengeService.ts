import { prisma } from '../lib/prisma.js';

/*
 * Obtem todos os desafios existentes
 * @returns Lista de desafios com detalhes do admin e participantes
 */
export const getChallenges = async () => {
  return prisma.desafio.findMany({
    include: {
      admin: true,
      participacoes: true,
    },
    orderBy: {
      data_inicio: 'desc',
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */

export const getChallengeById = async (id_desafio: number) => {
  return prisma.desafio.findUnique({
    where: { id_desafio },

    //Inclui detalhes do admin e participantes
    include: {
      admin: true,
      participacoes: {
        include: {
          utilizador: true,
        },
      },
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Criar um novo desafio
 * @param id_admin ID do admin que cria o desafio
 * @param titulo Título do desafio
 * @param data_inicio Data de início do desafio
 * @param data_fim Data de fim do desafio
 * @param badge Badge associada ao desafio
 * @param notificar Se deve notificar os utilizadores sobre o desafio
 * @returns O desafio criado
 */
export const createChallenge = async (
  id_admin: number,
  titulo: string,
  data_inicio: Date,
  data_fim: Date,
  badge: string,
  notificar: boolean,
  publicado: boolean = false,
  concluido: boolean = false
) => {
  return prisma.desafio.create({
    data: {
      id_admin,
      titulo,
      data_inicio,
      data_fim,
      badge,
      notificar,
      publicado,
      concluido,
    },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Atualizar um desafio existente
 * @param id_desafio ID do desafio a ser atualizado
 * @param dados - Campos a serem atualizados (titulo, datas, badge, notificar)
 * @returns O desafio atualizado
 */
export const updateChallenge = async (id: number, data: any) => {
  return prisma.desafio.update({
    where: { id_desafio: id },
    data,
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Eliminar um desafio
 * @param id_desafio ID do desafio a ser eliminado
 * @returns O desafio eliminado
 */
export const deleteChallenge = async (id_desafio: number) => {
  await prisma.desafioParticipacao.deleteMany({
    where: { id_desafio },
  });

  await prisma.feedPublicacao.deleteMany({
    where: { id_desafio },
  });

  return prisma.desafio.delete({
    where: { id_desafio },
  });
};

/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Permite a um utilizador juntar-se a um desafio
 * @param id_user ID do utilizador que quer juntar-se
 * @param id_desafio ID do desafio a ser juntado
 * @returns Registro de participação criado
*/
export const joinChallenge = async (id_user: number, id_desafio: number) => {
  const desafio = await prisma.desafio.findUnique({
    where: { id_desafio },
  });

  if (!desafio || !desafio.publicado || desafio.concluido) {
    throw new Error('Desafio não disponível');
  }

  return prisma.desafioParticipacao.upsert({
    where: {
      id_user_id_desafio: {
        id_user,
        id_desafio,
      },
    },
    update: {
      concluido: false,
    },
    create: {
      id_user,
      id_desafio,
      concluido: false,
    },
  });
};
/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Permite a um utilizador sair de um desafio
 * @param id_user ID do utilizador que quer sair
 * @param id_desafio ID do desafio a ser saído
*/
export const leaveChallenge = async (id_user: number, id_desafio: number) => {
  return prisma.desafioParticipacao.delete({
    where: {
      id_user_id_desafio: {
        id_user,
        id_desafio,
      },
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Obtem todos os participantes de um desafio específico
 * @param id_desafio ID do desafio para o qual se querem os participantes
 * @returns Lista de participações com dados dos utilizadores
*/
export const getChallengeParticipants = async (id_desafio: number) => {
  return prisma.desafioParticipacao.findMany({
    where: { id_desafio },
    include: {
      utilizador: true,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * Atualizar o progresso de um desafio para um utilizador 
 * @param id_user ID do utilizador cuja participação será atualizada
 * @param id_desafio ID do desafio para o qual a participação será atualizada
 * @param concluido Novo estado de conclusão da participação
 * @returns Participação atualizada
*/
export const updateChallengeProgress = async (
  id_user: number,
  id_desafio: number,
  concluido: boolean
) => {
  return prisma.desafioParticipacao.update({
    where: {
      id_user_id_desafio: {
        id_user,
        id_desafio,
      },
    },
    data: {
      concluido,
    },
  });
};


/** ----------------------------------------------------------------------------------------------------------------------- */
/** ----------------------------------------------------------------------------------------------------------------------- */
/*
 * marcar participante concluído
 * @param challengeId ID do desafio para o qual a participação será marcada como concluída
 * @param userId ID do utilizador cuja participação será marcada como concluída
 * @returns Participação atualizada com o estado de conclusão definido como true
*/
export const completeParticipant = async (challengeId: number, userId: number) => {
  return prisma.desafioParticipacao.updateMany({
    where: {
      id_desafio: challengeId,
      id_user: userId,
    },
    data: {
      concluido: true,
    },
  });
};