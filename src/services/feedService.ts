import { prisma } from '../lib/prisma.js';

export const getFeedPosts = async () => {
  return prisma.feedPublicacao.findMany({
    include: {
      utilizador: true,
      tarefa: true,
      subtask: true,
      desafio: true,
      likes: {
        include: {
          utilizador: true,
        },
      },
      comentarios: {
        include: {
          utilizador: true,
        },
        orderBy: {
          criadoEM: 'asc',
        },
      },
    },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};

export const getFeedPostById = async (id_publicacao: number) => {
  return prisma.feedPublicacao.findUnique({
    where: { id_publicacao },
    include: {
      utilizador: true,
      tarefa: true,
      subtask: true,
      desafio: true,
      likes: {
        include: {
          utilizador: true,
        },
      },
      comentarios: {
        include: {
          utilizador: true,
        },
        orderBy: {
          criadoEM: 'asc',
        },
      },
    },
  });
};

export const createFeedPost = async (data: {
  id_user: number;
  id_tarefa?: number;
  id_subtask?: number;
  id_desafio?: number;
  tipo:
    | 'TAREFA_EM_PROGRESSO'
    | 'TAREFA_CONCLUIDA'
    | 'SUBTAREFA_CONCLUIDA'
    | 'TAREFA_PARTILHADA'
    | 'DESAFIO_CONCLUIDO'
    | 'BADGE_RECEBIDO';
  comentario?: string;
  quer_participantes?: boolean;
  badge?: string;
}) => {
  return prisma.feedPublicacao.create({
    data: {
      id_user: data.id_user,
      id_tarefa: data.id_tarefa,
      id_subtask: data.id_subtask,
      id_desafio: data.id_desafio,
      tipo: data.tipo,
      comentario: data.comentario,
      quer_participantes: data.quer_participantes ?? false,
      badge: data.badge,
    },
    include: {
      utilizador: true,
      tarefa: true,
      subtask: true,
      desafio: true,
    },
  });
};

export const deleteFeedPost = async (id_publicacao: number) => {
  return prisma.feedPublicacao.delete({
    where: { id_publicacao },
  });
};

export const addLikeToPost = async (id_publicacao: number, id_user: number) => {
  return prisma.feedLike.create({
    data: {
      id_publicacao,
      id_user,
    },
  });
};

export const removeLikeFromPost = async (id_publicacao: number, id_user: number) => {
  return prisma.feedLike.delete({
    where: {
      id_publicacao_id_user: {
        id_publicacao,
        id_user,
      },
    },
  });
};

export const getCommentsByPost = async (id_publicacao: number) => {
  return prisma.feedComentario.findMany({
    where: { id_publicacao },
    include: {
      utilizador: true,
    },
    orderBy: {
      criadoEM: 'asc',
    },
  });
};

export const addCommentToPost = async (
  id_publicacao: number,
  id_user: number,
  comentario: string,
) => {
  return prisma.feedComentario.create({
    data: {
      id_publicacao,
      id_user,
      comentario,
    },
    include: {
      utilizador: true,
    },
  });
};

export const deleteCommentFromPost = async (id_comentario: number) => {
  return prisma.feedComentario.delete({
    where: { id_comentario },
  });
};