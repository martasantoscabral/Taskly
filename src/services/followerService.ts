import { prisma } from '../lib/prisma.js';

export const getFollowersByUser = async (id_user: number) => {
  return prisma.seguidor.findMany({
    where: { seguido_id: id_user },
    include: {
      seguidor: true,
    },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};

export const getFollowingByUser = async (id_user: number) => {
  return prisma.seguidor.findMany({
    where: { seguidor_id: id_user },
    include: {
      seguido: true,
    },
    orderBy: {
      criadoEM: 'desc',
    },
  });
};

export const followUser = async (seguidor_id: number, seguido_id: number) => {
  return prisma.seguidor.create({
    data: {
      seguidor_id,
      seguido_id,
    },
  });
};

export const unfollowUser = async (seguidor_id: number, seguido_id: number) => {
  return prisma.seguidor.delete({
    where: {
      seguido_id_seguidor_id: {
        seguido_id,
        seguidor_id,
      },
    },
  });
};