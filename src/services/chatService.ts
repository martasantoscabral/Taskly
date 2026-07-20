import { prisma } from "../lib/prisma.js";

/**
 * Verifica se um utilizador pertence a um grupo.
 */
export async function utilizadorPertenceAoGrupo(
  grupoId: number,
  userId: number,
) {
  return prisma.utilizadorGrupo.findUnique({
    where: {
      gr_id_ut_id: {
        gr_id: grupoId,
        ut_id: userId,
      },
    },
  });
}

/**
 * Lista todas as mensagens de um grupo,
 * da mais antiga para a mais recente.
 */
export async function getMensagensGrupo(grupoId: number) {
  return prisma.mensagemGrupo.findMany({
    where: {
      grupo_id: grupoId,
    },

    include: {
      utilizador: {
        select: {
          id_utilizador: true,
          nome: true,
          handle: true,
        },
      },
    },

    orderBy: {
      criadaEm: "asc",
    },
  });
}

/**
 * Cria uma nova mensagem num grupo.
 */
export async function createMensagemGrupo(
  grupoId: number,
  userId: number,
  texto: string,
) {
  return prisma.mensagemGrupo.create({
    data: {
      grupo_id: grupoId,
      user_id: userId,
      texto,
    },

    include: {
      utilizador: {
        select: {
          id_utilizador: true,
          nome: true,
          handle: true,
        },
      },
    },
  });
}